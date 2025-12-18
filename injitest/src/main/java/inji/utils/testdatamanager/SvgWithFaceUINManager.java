package inji.utils.testdatamanager;

import inji.models.Uin;
import inji.utils.InjiWalletConfigManager;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class SvgWithFaceUINManager {

    private static final BlockingQueue<Uin> availableUINs = new LinkedBlockingQueue<>();

    static {
        String uin = InjiWalletConfigManager.getproperty("svgwithface_uin");
        if (uin == null || uin.isEmpty()) {
        	throw new IllegalStateException("Configuration 'svgwithface_uin' is not set");
        	}

        for (int i = 0; i < 5; i++) {
            availableUINs.add(new Uin(uin));
        }
    }


    //Sample data, data can be passed in this way as well
//  static {
//      availableUINs.add(new Uin("9876543210"));
//      availableUINs.add(new Uin("9876543210"));
//      availableUINs.add(new Uin("9876543210"));
//      availableUINs.add(new Uin("9876543210"));
//      availableUINs.add(new Uin("9876543210"));
//  }

    public static Uin acquireUIN() throws InterruptedException {
        return availableUINs.take();
    }

    public static void releaseUIN(Uin uin) {
        availableUINs.offer(uin);
    }

    public static Uin acquireUINWithTimeout(long timeoutSeconds) throws InterruptedException {
        return availableUINs.poll(timeoutSeconds, TimeUnit.SECONDS);
    }
}
