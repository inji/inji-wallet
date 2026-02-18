package inji.utils;


import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.WebSocket;
import java.net.http.WebSocket.Listener;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.CompletionStage;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.mosip.testrig.apirig.otp.Root;
import io.mosip.testrig.apirig.utils.AdminTestUtil;
import io.mosip.testrig.apirig.utils.ConfigManager;
import io.mosip.testrig.apirig.utils.GlobalConstants;

public class OTPListener {

    private static final Logger logger = Logger.getLogger(OTPListener.class);

    // 🔐 One queue per email
    private static final ConcurrentHashMap<String, BlockingQueue<OtpMessage>> otpQueues =
            new ConcurrentHashMap<>();
    
    // Time stamp variable
    private static final ThreadLocal<Long> requestWatermark =
            ThreadLocal.withInitial(() -> 0L);

    public static volatile boolean bTerminate = false;

    public OTPListener() {
        if (ConfigManager.IsDebugEnabled()) {
            logger.setLevel(Level.ALL);
        } else {
            logger.setLevel(Level.ERROR);
        }
    }

    public void run() {
        try {
            String a1 = "wss://smtp.";
            String externalurl = ConfigManager.getIAMUrl();

            if (externalurl.contains("/auth")) {
                externalurl = externalurl.replace("/auth", "");
            }
            String a2 = externalurl.substring(externalurl.indexOf(".") + 1);
            String a3 = "/mocksmtp/websocket";

            HttpClient.newHttpClient()
                    .newWebSocketBuilder()
                    .buildAsync(URI.create(a1 + a2 + a3), new WebSocketClient())
                    .join();

        } catch (Exception e) {
            logger.error("Failed to start OTP listener", e);
        }
    }

    // ---------------------------------------------------------------------
    // WebSocket listener
    // ---------------------------------------------------------------------
    private static class WebSocketClient implements WebSocket.Listener {

        @Override
        public void onOpen(WebSocket webSocket) {
            logger.info("OTP WebSocket opened");
            Listener.super.onOpen(webSocket);
        }

        @Override
        public CompletionStage<?> onText(WebSocket webSocket, CharSequence data, boolean last) {

            if (bTerminate) {
                logger.info("OTP Listener terminating");
                webSocket.sendClose(WebSocket.NORMAL_CLOSURE, "Suite finished");
                return Listener.super.onText(webSocket, data, last);
            }

            try {
                ObjectMapper om = new ObjectMapper();
                Root root = om.readValue(data.toString(), Root.class);

                String message = "";
                String address = "";

                if ("SMS".equals(root.type)) {
                    message = root.subject;
                    address = root.to.text.trim();

                } else if ("MAIL".equals(root.type)) {
                    message = root.html;
                    address = root.to.value.get(0).address;

                } else {
                    logger.error("Unsupported notification type: " + root.type);
                    return Listener.super.onText(webSocket, data, last);
                }

                if (!parseOtp(message).isEmpty()
                        || !parseAdditionalReqId(message).isEmpty()) {

                    otpQueues
                        .computeIfAbsent(address, k -> new LinkedBlockingQueue<>())
                        .offer(new OtpMessage(message));

                    logger.info("OTP message queued for " + address);
                }

            } catch (Exception e) {
                logger.error("Error processing OTP message", e);
            }

            return Listener.super.onText(webSocket, data, last);
        }

        @Override
        public void onError(WebSocket webSocket, Throwable error) {
            logger.error("WebSocket error", error);
            Listener.super.onError(webSocket, error);
        }
    }

    // ---------------------------------------------------------------------
    // OTP retrieval (timestamp-based)
    // ---------------------------------------------------------------------
    public static String getOtp(String emailId) {

        if (ConfigManager.getUsePreConfiguredOtp()
                .equalsIgnoreCase(GlobalConstants.TRUE_STRING)) {
            return ConfigManager.getPreConfiguredOtp();
        }
        long afterTime = requestWatermark.get(); // Get the timestamp for this thread
        BlockingQueue<OtpMessage> queue =
                otpQueues.computeIfAbsent(emailId, k -> new LinkedBlockingQueue<>());

        long timeoutSeconds = AdminTestUtil.getOtpExpTimeFromActuator();
        long endTime = System.currentTimeMillis() + timeoutSeconds * 1000;

        try {
            while (System.currentTimeMillis() < endTime) {

                OtpMessage otpMsg = queue.poll(5, TimeUnit.SECONDS);
                if (otpMsg == null) {
                    continue;
                }

                // 🚫 Ignore stale OTPs
                if (otpMsg.receivedAt < afterTime) {
                    logger.info("Skipping stale OTP for " + emailId);
                    continue;
                }

                String otp = parseOtp(otpMsg.message);
                if (!otp.isEmpty()) {
                    logger.info("Found OTP for " + emailId + " : " + otp);
                    return otp;
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        logger.info("OTP not found for " + emailId);
        return "";
    }

    // ---------------------------------------------------------------------
    // Additional ReqId retrieval (timestamp-based)
    // ---------------------------------------------------------------------
    public static String getAdditionalReqId(String emailId) {
    	long afterTime = requestWatermark.get(); // Get the timestamp for this thread
        BlockingQueue<OtpMessage> queue =
                otpQueues.computeIfAbsent(emailId, k -> new LinkedBlockingQueue<>());

        int maxWaitSeconds = 10 * (AdminTestUtil.OTP_CHECK_INTERVAL / 1000);
        long endTime = System.currentTimeMillis() + maxWaitSeconds * 1000L;

        try {
            while (System.currentTimeMillis() < endTime) {

                OtpMessage msg = queue.poll(5, TimeUnit.SECONDS);
                if (msg == null) {
                    continue;
                }

                // 🚫 Ignore stale messages
                if (msg.receivedAt < afterTime) {
                    logger.info("Skipping stale AdditionalReqId message for " + emailId);
                    continue;
                }

                String additionalReqId = parseAdditionalReqId(msg.message);
                if (!additionalReqId.isEmpty()) {
                    logger.info("Found AdditionalReqId for " + emailId + " : " + additionalReqId);
                    return additionalReqId;
                }
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        logger.info("AdditionalReqId not found for " + emailId);
        return "";
    }


    // ---------------------------------------------------------------------
    // Parsing helpers
    // ---------------------------------------------------------------------
    private static String parseOtp(String message) {
        Pattern pattern = Pattern.compile("(|^)\\s\\d{6}\\s");
        if (message == null) return "";

        Matcher matcher = pattern.matcher(message);
        if (matcher.find()) {
            return matcher.group(0).trim();
        }
        return "";
    }

    private static String parseAdditionalReqId(String message) {
        String val = StringUtils.substringBetween(
                message,
                "AdditionalInfoRequestId",
                "-BIOMETRIC_CORRECTION-1"
        );
        return val == null ? "" : val;
    }

    // ---------------------------------------------------------------------
    // Internal wrapper
    // ---------------------------------------------------------------------
    private static class OtpMessage {
        final String message;
        final long receivedAt;

        OtpMessage(String message) {
            this.message = message;
            this.receivedAt = System.currentTimeMillis();
        }
    }
    
    // ---------------------------------------------------------------------
    // Mark Request start time
    // ---------------------------------------------------------------------
    public static void markRequestStart() {
        requestWatermark.set(System.currentTimeMillis());
    }
    
    // ---------------------------------------------------------------------
    // Removing the Mark Request time
    // ---------------------------------------------------------------------
    public static void markRequestRemove() {
        requestWatermark.remove();
    }
}