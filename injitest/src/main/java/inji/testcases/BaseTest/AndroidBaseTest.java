package inji.testcases.BaseTest;

import inji.constants.PlatformType;

public class AndroidBaseTest extends BaseTest {
    @Override
    protected PlatformType getPlatformType() {
        return PlatformType.ANDROID;
    }
}
