package inji.utils.testdatamanager;

import inji.models.Uin;
import inji.utils.InjiWalletConfigManager;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class LandRegistryUINManager {

    private static final BlockingQueue<Uin> availableUINs = new LinkedBlockingQueue<>();

    static {
        String uin = InjiWalletConfigManager.getproperty("landregistry.uin");

        for (int i = 0; i < 5; i++) {
            availableUINs.add(new Uin(uin));
        }
    }


    //Sample data, data can be passed in this way as well
//    static {
//        availableUINs.add(new Uin("9261481024", "6167173343", "InjiWallet_AddIdentity_withValidParameters_smoke_Pos@mosip.net"));
//        availableUINs.add(new Uin("9261481024", "6167173343", "InjiWallet_AddIdentity_withValidParameters_smoke_Pos@mosip.net"));
//        availableUINs.add(new Uin("9261481024", "6167173343", "InjiWallet_AddIdentity_withValidParameters_smoke_Pos@mosip.net"));
//        availableUINs.add(new Uin("9261481024", "6167173343", "InjiWallet_AddIdentity_withValidParameters_smoke_Pos@mosip.net"));
//        availableUINs.add(new Uin("9261481024", "6167173343", "InjiWallet_AddIdentity_withValidParameters_smoke_Pos@mosip.net"));
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
