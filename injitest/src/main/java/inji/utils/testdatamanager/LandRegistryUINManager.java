package inji.utils.testdatamanager;

import inji.models.Uin;
import inji.utils.InjiWalletConfigManager;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class LandRegistryUINManager {

    private static final BlockingQueue<Uin> availableUINs = new LinkedBlockingQueue<>();

    static {
        String uin = InjiWalletConfigManager.getproperty("landregistry_uin");
        if (uin == null || uin.isEmpty()) {
        	throw new IllegalStateException("Configuration 'landregistry_uin' is not set");
        	}
        for (int i = 0; i < 5; i++) {
            availableUINs.add(new Uin(uin));
        }
    }


    //Sample data, data can be passed in this way as well
//    static {
//        availableUINs.add(new Uin("2154189532"));
//        availableUINs.add(new Uin("2154189532"));
//        availableUINs.add(new Uin("2154189532"));
//        availableUINs.add(new Uin("2154189532"));
//        availableUINs.add(new Uin("2154189532"));
//    }

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
