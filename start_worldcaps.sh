#!/bin/bash

# 1. Automatically find the folder this script is in, no matter where your friend unzips it
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 2. Kill any old versions of the server running in the background to prevent port conflicts
pkill -f "python3 nocache_server.py"

# 3. Start the server in the background
python3 nocache_server.py >/dev/null 2>&1 &
SERVER_PID=$!

# 4. Wait a second for the server to spin up
sleep 1

# 5. Open the game in the default web browser
xdg-open http://localhost:8000/worldcaps_globe_intro.html

# 6. Keep the terminal open and cleanly shut down the server when closed
echo "========================================="
echo " WorldCaps Game Server is Running!"
echo "========================================="
echo "Close this terminal window or press CTRL+C to stop the server."

# This ensures that when the terminal closes, the Python server dies with it
trap "kill $SERVER_PID 2>/dev/null" EXIT

# Wait indefinitely while the server runs
wait $SERVER_PID
