# AJ Classic for Linux (Experimental) (Unofficial)
This is an unofficial [AJ Classic](https://classic.animaljam.com) port for Linux. Unlike other clients, this one uses parts of the official client. When you run it for the first time, it'll automatically download the AJ Classic game files as well as Flash Player. Since this port downloads everything at runtime, it doesn't include any of WildWorks or Adobe's proprietary blobs in it's source code, which is why I'm able to distribute it! It's available for x64 and ARM systems, and there are plans to make it run on Windows and Mac as well.

> [!CAUTION]
> DO NOT use this to attempt to hack AJ Classic or bypass its restrictions! This project is ONLY intended for compatibility purposes,
> and we are not responsible for anything resulting from the incorrect use of this tool!

## Features
* Runs natively on Linux - no WINE, no Boxed86
* Patches Flash automatically - no annoying EOL warnings
* Automatically downloads official app updates from the official AJ website
* 99% of AJ Classic features work out of the box

## How to install
Currently, it's experimental, so you have to install the binaries manually. I've provided them in `.tar.gz` files in the `Releases` tab:
* Download [AJ.Classic-linux-armv7l.tar.gz](https://github.com/themirrazz/ajc-linux/releases/download/v0.0.1-alpha/AJ.Classic-linux-armv7l.tar.gz) if you're on an ARM-based Chromebook or a Raspberry Pi.
* Download [AJ.Classic-linux-x64.tar.gz](https://github.com/themirrazz/ajc-linux/releases/download/v0.0.1-alpha/AJ.Classic-linux-x64.tar.gz) if you're on a laptop, PC, or an x86_64-based Chromebook.

> [!WARNING]
> I still need to test it on an ARMv7l device, I will do that later tonight.

## How to use
You should see a popup that says "Updating". It'll start installing AJ Classic and Pepper Flash, and once it's done, you should see the AJ Classic login screen appear. Sign in with your Animal Jam account and you should be good to go!

## Known issues
### The app isn't launching on Raspberry Pi
Raspbian no longer includes ARMv7 (Aarch32) dependencies by default. To install them, run this code in your terminal:
```bash
sudo dpkg --add-architecture armhf
sudo apt install libc6:armhf
sudo apt install chromium-browser:armhf
```
This installs the 32-bit version of Chromium and LibC, which automatically installs all the dependencies required by this client.
