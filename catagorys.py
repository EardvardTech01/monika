import random
from monika import channels

# List of functions
CatagorysList = [
    channels.HentaiTags,
    channels.Anime,
    channels.MarvelComics,
    channels.DCComics,
    channels.StarWars,
    channels.SpecificCharacters,
    channels.FutanariandFemboys,
    channels.MythsandFantasy,
    channels.Furry,
    channels.Games,
    channels.IRL,
    channels.OtherIRL
]

def catagorys():
    random_function = random.choice(CatagorysList)  # Select one random function
    return random_function()  # Execute and return the result of the chosen function
