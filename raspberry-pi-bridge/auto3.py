import serial
import time
import subprocess
import sys
import os

# === CONFIGURATION ===
# Update these for your Raspberry Pi setup
SERIAL_PORT = "/dev/ttyUSB0"    # Verify with: ls /dev/tty* on your Pi
BAUD_RATE = 9600

# Path to the capture script on the Pi
CAPTURE_SCRIPT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "auto_capture_3_updated.py")

def capture_and_process():
    print("[INFO] Trigger received. Capturing and saving images...")
    subprocess.run(["python3", CAPTURE_SCRIPT])
    print("[INFO] Capture complete. Waiting for next trigger.\n")

def main():
    print("[INFO] Waiting for CAPTURE trigger from Arduino...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)
    except serial.SerialException:
        print(f"[ERROR] Could not connect to {SERIAL_PORT}. Check USB cable or port.")
        return

    while True:
        if ser.in_waiting > 0:
            msg = ser.readline().decode(errors='ignore').strip()
            print(f"[INFO] From Arduino: {msg}")

            if msg == "CAPTURE":
                capture_and_process()
            elif msg == "PAUSE":
                print("[INFO] Automation PAUSED by Arduino.")
            elif msg == "STOP":
                print("[INFO] Automation STOPPED by Arduino. Exiting.")
                ser.close()
                sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n[INFO] Program interrupted manually. Exiting.")
        sys.exit(0)
