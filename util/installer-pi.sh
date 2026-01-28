#!/bin/bash
sudo dpkg --add-architecture armhf
sudo apt update
sudo apt install libc6:armhf libasound2:armhf libasound2-dev:armhf libstdc++6:armhf
