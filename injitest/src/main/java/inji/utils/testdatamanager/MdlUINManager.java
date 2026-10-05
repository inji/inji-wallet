package inji.utils.testdatamanager;

import inji.models.Uin;
import inji.utils.InjiWalletConfigManager;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

public class MdlUINManager {
  private static final BlockingQueue<Uin> availableUINs = new LinkedBlockingQueue<>();

  static {
    String uin = InjiWalletConfigManager.getproperty("mdl_uin");
    if (uin == null || uin.isEmpty()) {
      throw new IllegalStateException("Configuration 'mld_uin' is not set");
    }

    for (int i = 0; i < 5; i++) {
      availableUINs.add(new Uin(uin));
    }
  }

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
