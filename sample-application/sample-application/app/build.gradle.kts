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

        // Enable 16 KB page size support for Android 15+
        ndk {
            //noinspection ChromeOsAbiSupport
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86", "x86_64")
        }
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
        jniLibs {
            // Use legacy packaging for native libraries to maintain compatibility
            useLegacyPackaging = true
        }
    }
}

//configurations.all {
//  resolutionStrategy {
//    eachDependency {
//      if (requested.group == "io.mosip" && requested.name == "vcverifier-jar") {
//        useTarget("io.mosip:vcverifier-jar:999.0.0-does-not-exist") // Forces a non-existent version
//        because("Exclude all vcverifier-jar to avoid duplicate class issues")
//      }
//    }
//  }
//}

dependencies {


    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)


    implementation("io.inji:inji-vci-client-aar:0.7.0-MC1") {
        // Exclude transitive dependencies to use explicitly declared versions
        exclude(group = "com.google.crypto.tink", module = "tink")
        exclude(group = "io.mosip", module = "vcverifier-jar")
        exclude(group = "com.google.protobuf", module = "protobuf-java")
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
   implementation("io.mosip:vcverifier-aar:1.5.0") { // Verifiable Credential Verification Library
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
      exclude(group = "io.mosip:vcverifier-jar")
      exclude(group = "io.mosip:vcverifier-aar")
        // Exclude transitive dependencies to prevent conflicts and use explicitly declared versions
        exclude(group = "org.bouncycastle")
        exclude(group = "org.springframework")
        exclude(group = "com.apicatalog", module = "titanium-json-ld-jre8")
    }

    implementation("com.apicatalog:titanium-json-ld:1.3.2")

    implementation("org.bouncycastle:bcprov-jdk18on:1.74")

    // CameraX dependencies for QR code scanning
    implementation("androidx.camera:camera-camera2:1.3.1")
    implementation("androidx.camera:camera-lifecycle:1.3.1")
    implementation("androidx.camera:camera-view:1.3.1")

    // ML Kit Barcode Scanning
    implementation("com.google.mlkit:barcode-scanning:17.2.0")

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

