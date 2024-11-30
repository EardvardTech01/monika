import discord
import asyncio
import json
from datetime import datetime
import channels
import catagorys
from discord.ext import commands
from dotenv import load_dotenv
from discord.ext.commands import MissingRequiredArgument
import os

intents = discord.Intents.all()
intents.members = True
intents.messages = True
intents.message_content = True

client = commands.Bot(command_prefix="!", intents=intents)

# File path for saving and loading user data
USER_DATA_FILE = "user_assignments.json"

# Load environment variables from the .env file
load_dotenv()

# Get the Discord token from the environment variables
MONIKA_TOKEN = os.getenv("MONIKA_TOKEN")

# Load user assignments from a JSON file
def load_user_assignments():
    try:
        with open(USER_DATA_FILE, "r") as file:
            return json.load(file)
    except FileNotFoundError:
        return {  # Default structure if file doesn't exist
            "Sunday": [],
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": []
        }

# Save user assignments to a JSON file
def save_user_assignments():
    with open(USER_DATA_FILE, "w") as file:
        json.dump(user_assignments, file, indent=4)

# Load existing user data when the bot starts
user_assignments = load_user_assignments()

@client.event
async def on_ready():
    print(f'Logged in')
    while True:
        await talk()
        await asyncio.sleep(60)

def trigger_action():
    print("Action triggered!")

def has_role(member, role_name):
    # Check if the member has the specified role
    return any(role.name == role_name for role in member.roles)

async def talk():
    # Make sure the channel ID is correct
    channel = client.get_channel(1209213695410835487)
    allow = True

    if channel:
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        day = now.strftime("%A")

        # Check for specific times (e.g., 7:00 AM, 12:00 PM, 6:00 PM)
        if allow == True and current_time == "09:00":
            allow = False

            daily_tasks = {
                # await channel.send(f"RanchPizza Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting")
                "Sunday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Monday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Tuesday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Wednesday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Thursday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Friday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting",
                "Saturday": f"Alright it's your turn, don't forget to post today. Or mommy will be disapointed!! Your channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting"
            }

            if day in user_assignments and user_assignments[day]:
                print("day")
                for user_id in user_assignments[day]:
                    await channel.send(f"<@{user_id}> {daily_tasks[day]}")

        else:
            allow = True
    else:
        print("Channel not found or the bot lacks permission.")

@client.command()
@commands.has_permissions(administrator=True)
async def add_user(ctx, day: str = None, user_id: int = None):
    """Add a user to the specified day."""
    if not day or not user_id:
        # Handle the case where day or user_id is missing
        await ctx.send("You need to provide both the day and user ID. The correct format is:\n`!add_user <day> <user_id>`.\nFor example: `!add_user Monday 123456789012345678`.")
        return

    if day not in user_assignments:
        await ctx.send(f"Invalid day: {day}. Please use a valid day of the week.")
        return

    # Add user to the list for the specified day
    if str(user_id) not in user_assignments[day]:
        user_assignments[day].append(str(user_id))
        save_user_assignments()  # Save to the JSON file
        await ctx.send(f"User <@{user_id}> has been added to {day}'s list.")
    else:
        await ctx.send(f"User <@{user_id}> is already in {day}'s list.")

@client.command()
@commands.has_permissions(administrator=True)
async def channel_roulette(ctx):
    await ctx.send(f"{ctx.author.mention} Alright your selected channels are: <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, <#{catagorys.catagorys()}>, and a channel of your choosing!! Happy posting")

@client.command()
@commands.has_permissions(administrator=True)
async def remove_user(ctx, day: str = None, user_id: int = None):
    """Remove a user from the specified day."""
    if not day or not user_id:
        # Handle the case where day or user_id is missing
        await ctx.send("You need to provide both the day and user ID. The correct format is:\n`!remove_user <day> <user_id>`.\nFor example: `!remove_user Monday 123456789012345678`.")
        return

    if day not in user_assignments:
        await ctx.send(f"Invalid day: {day}. Please use a valid day of the week.")
        return

    # Remove user from the list for the specified day
    if str(user_id) in user_assignments[day]:
        user_assignments[day].remove(str(user_id))
        save_user_assignments()  # Save to the JSON file
        await ctx.send(f"User <@{user_id}> has been removed from {day}'s list.")
    else:
        await ctx.send(f"User <@{user_id}> is not in {day}'s list.")

@client.command()
@commands.has_permissions(administrator=True)
async def show_users(ctx, day: str = None):
    """Show the users assigned to a specific day."""
    if not day:
        # Handle the case where day or user_id is missing
        await ctx.send("You need to provide day. The correct format is:\n`!show_users <day>`.\nFor example: `!show_users Monday`.")
        return

    if day not in user_assignments:
        await ctx.send(f"Invalid day: {day}. Please use a valid day of the week.")
        return

    users = user_assignments[day]
    if users:
        await ctx.send(f"Users assigned to {day}: " + ", ".join([f"<@{user}>" for user in users]))
    else:
        await ctx.send(f"No users assigned to {day}.")

async def time():
    # Define what the bot does periodically (e.g., sending a message)
    await on_ready()

client.run(MONIKA_TOKEN)
