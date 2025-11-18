plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.samplecredentialwallet"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.samplecredentialwallet"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
    
    packaging {
        resources {
            excludes += setOf(
                "META-INF/license.txt",
                "META-INF/LICENSE.txt",
                "META-INF/LICENSE",
                "META-INF/notice.txt",
                "META-INF/NOTICE.txt",
                "META-INF/NOTICE",
                "META-INF/DEPENDENCIES",
                "META-INF/ASL2.0",
                "META-INF/*.kotlin_module"
            )
        }
    }
}

dependencies {

    
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)


    implementation("io.mosip:inji-vci-client-aar:0.5.0") {
        // Exclude transitive dependencies to use explicitly declared versions
        exclude(group = "com.apicatalog", module = "titanium-json-ld-jre8")
        exclude(group = "org.bouncycastle")
    }
    
    implementation("com.nimbusds:nimbus-jose-jwt:10.6") //JWT Signing Library

    implementation("io.mosip:secure-keystore:0.3.0") {   // Secure Keystore Library
        // Exclude transitive dependencies to prevent conflicts and use explicitly declared versions
        exclude(group = "org.bouncycastle")
        exclude(group = "org.springframework")
        exclude(group = "com.apicatalog", module = "titanium-json-ld-jre8")
    }
   implementation("io.mosip:vcverifier-aar:1.4.0") { // Verifiable Credential Verification Library
        // Exclude transitive dependencies to prevent conflicts and use explicitly declared versions
        exclude(group = "org.bouncycastle")
        exclude(group = "org.springframework")
        exclude(group = "com.apicatalog", module = "titanium-json-ld-jre8")
    }

    implementation("androidx.navigation:navigation-compose:2.8.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.5")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.5")

    
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.browser:browser:1.8.0")


    implementation("androidx.biometric:biometric:1.1.0")
    implementation("androidx.fragment:fragment-ktx:1.8.5")


    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
   
    implementation("io.mosip:pixelpass-aar:0.7.0") {
        // Exclude transitive dependencies to prevent conflicts and use explicitly declared versions
        exclude(group = "org.bouncycastle")
        exclude(group = "org.springframework")
        exclude(group = "com.apicatalog", module = "titanium-json-ld-jre8")
    }

    implementation("com.apicatalog:titanium-json-ld:1.3.2")
    
    implementation("org.bouncycastle:bcprov-jdk18on:1.74")


    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}