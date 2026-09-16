package inji.utils;

import org.apache.log4j.Logger;
import org.testng.ISuite;
import org.testng.ISuiteListener;
import org.testng.xml.XmlSuite;

public class ThreadCountListener implements ISuiteListener {
    private static final Logger logger = Logger.getLogger(ThreadCountListener.class);

    @Override
    public void onStart(ISuite suite) {
        try {
            int threadCount = Integer.parseInt(InjiWalletConfigManager.getproperty("thread_count"));

            XmlSuite xmlSuite = suite.getXmlSuite();
            xmlSuite.setThreadCount(threadCount);

            logger.info("Thread count overridden to: " + threadCount);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Failed to set BrowserStack session name: " + e.getMessage());
            logger.info("Thread count overridden is failed so sticking to default thread");
        }
    }

    @Override
    public void onFinish(ISuite suite) {
        // nothing to do
    }
}
