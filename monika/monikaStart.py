# monikaStart.py

import asyncio
from monikaCommands import time, talk  # Import the time function from monikaCommands

async def main():
    # Run the time function in a loop
    while True:
        await talk()  # Call the time() function from monikaCommands
        await asyncio.sleep(5)  # Adjust the sleep time as needed to prevent infinite rapid loops

# Start the asyncio event loop
asyncio.run(main())
