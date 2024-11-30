import random

HentaiTagsList = [
        "1287871342842089613", #69
        "1236094397079355412", #1-Girl
        "1209206404871618660", #ass
        "1209206424807415878", #anal
        "1209206455748665354", #ahegeo
        "1209206541027385506", #boobs
        "1216156442248216616", # boob-sucking
        "1209206580264829019", # bbw
        "1246587815274483712", # belly
        "1236092130901102674", # big-dick
        "1212171413553684620", # blow-job-deepthroat
        "1257475243723980811", # cosplay
        "1215411947722252348", # bunny-girl
        "1226629914917339156", # cow-girl
        "1215411997328408586", # clown-girl
        "1209206647843717161", # cumshot
        "1215767284250050660", # cum
        "1209206866782064691", # darkskin
        "1209207097166798888", # goth
        "1236092597219627128", # hand-job
        "1210968368803483650", # latex
        "1213268948804706394", # nuns
        "1209207421407469630", # milf
        "1287866671209517266", # mating-press
        "1215762834328125643", # masterbation
        "1209207441041129564", # maid
        "1242962409069482114", # muscles
        "1209207565972406302", # paizuri
        "1216160658236899499", # panties
        "1216452115103223890", # robot
        "1271140049702097078", # squirt
        "1213973299672121364", # swimsuit
        "1212173622865698876", # spreading
        "1242246386846662667", # skirts-and-dresses
        "1209207789172559922", # tomboys
        "1215764383972593835", # toys
        "1209207854704230420", # thighs
        "1226624822100889781", # vanilla
        "1223378665375793195", # vtubers
        "1209283381779763283", # yuri
]

AnimeList = [
        "1209205374968660069", # aot
        "1209215886683144244", # bleach
        "1210352354860343426", # black-clover
        "1229929073665642496", # berserk
        "1232462137604050954", # blue-archive
        "1209205399983628378", # chainsawman
        "1209205474910543902", # demon-slayer
        "1209205682444968067", # dragon-ball
        "1242965191445053550", # fairy-tail
        "1211452882122182726", # highschool-dxd
        "1241796893965549678", # highschool-of-the-dead
        "1209205348146217121", # jujutsu-kaisen
        "1211453176905998377", # konosuba
        "1216439407633236169", # kill-la-kill
        "1216416214973419671", # love-is-war
        "1209205849424400514", # my-hero-academia
        "1209205621514178650", # naruto
        "1244059509522170018", # neon-genesis-evangelion
        "1209205955070271519", # one-piece
        "1209205536264953936", # one-punch-man
        "1212094580799832215", # pokimon-girls
        "1211080747876884531", # rwby
        "1209630460909588531", # sailor-moon
        "1220743770983632956", # sousou-no-frieren
        "1209981830334386248", # that-time-i-got-reincarnated-as-a-slime
        "1210650825399996426", # yu-gi-oh
        "1229929396803207290" # 80-90style
]

CartoonsandComicsList = [
        "1209974551962980362", # looney-toons
        "1216443167360942231" # disney
]

MarvelComicsList = [
        "1209973946472992879", # marvel-other
        "1212036143185395742", # black-cat
        "1212036641594802206", # black-widow
        "1212036722410397707", # captain-marvel
        "1212036952627617862", # domino
        "1212037017257648168", # emma-frost
        "1212037451699331144", # gamora
        "1212038585021108255", # gwen-stacy
        "1212037605911433228", # jubilee
        "1212037640132624444", # jean-grey
        "1212037372615860305", # kitty-pryde
        "1212037720315273297", # magik
        "1212037859914022982", # mary-jane
        "1212039843178225664", # mayday-parker
        "1212038217478705183", # nebula
        "1212038448127418408", # psylocke
        "1212038662469066823", # rogue
        "1212038859253350410", # scarlet-witch
        "1212038897622589451", # she-hulk
        "1212038928551641139", # silk
        "1212039291979440129", # symbiotes
        "1212039189281898607", # storm
        "1212039113729904812" # spider-woman
]

DCComicsList = [
        "1209973927351287860", # dc-other
        "1212042970212081715", # barbara-gordon
        "1212051858244247643", # batwoman
        "1212042972200435742", # black-canary
        "1212044103257423912", # blackfire
        "1212052355260878919", # cassandra-cain
        "1212043024713125938", # catwoman
        "1212043090844586065", # cheetah
        "1212043051019665438", # harly-quinn
        "1212043051694948394", # huntress
        "1212044122119077928", # jinx
        "1212043091305824297", # killer-frost
        "1212043106841796668", # livewire
        "1212043052760305664", # lois-lane
        "1212043090102198372", # poison-ivy
        "1212053460485275678", # miss-martian
        "1212043107105906708", # powergirl
        "1212051390835327007", # punchline
        "1212044104205209690", # raven
        "1212044104519909436", # rose-wilson
        "1212043108221714493", # supergirl
        "1212043109131882516", # starfire
        "1212046416545980456", # star-sapphire
        "1212044122018414683", # terra
        "1212044123368853544", # wonder-woman
        "1212044746873372692" # zatanna
]

StarWarsList = [
        "1210237019515654215", # other
        "1212528989436903474", # aayla-secura
        "1212055281794682890", # ahsoka-tano
        "1212529424508002315", # asajj-ventress
        "1212529183532650546", # barriss-offee
        "1212057767406207076", # bo-katan
        "1212058929161441290", # doctor-aphra
        "1212529343016734790", # darth-talon
        "1212058251819229204", # hera-syndulla
        "1212529288134525039", # jyn-erso
        "1212056992504610916", # leia-organa
        "1212529718839214080", # merin
        "1212056906919714886", # padmé-amidala
        "1212057353927663676", # rey
        "1212529959814434856", # riyo-chuchi
        "1212057545078874112", # sabine-wren
        "1212059231398662265" # the-seventh-sister
]

ExtremeTagsList = [
        "1209206562984431667", # bdsm
        "1234274369950191686", # cum-inflation
        "1223742215604408390", # feral
        "1209206994771116074", # femdom
        "1226626632555565077", # gang-bang
        "1287866350051790899", # gaping
        "1255954686641705090", # gross
        "1212172185024729139", # hardcore
        "1243606371207745696", # hyper
        "1234152371777704006", # incest
        "1216156470308110336", # milk
        "1213972341927706715", # ntr
        "1209608446073241681", # pregnant
        "1242246049704181940", # public
        "1237543163418247229", # pubic-hair
        "1209847489461751838", # stomach-bulge
        "1246474001304387585", # transformation
        "1209207767089422437", # tentacle
        "1213970674344001557" # ugly-bastard
]

SpecificCharactersList = [
        "1242964127484350505", # 2b
        "1210651256692015104", # 02
        "1209214339261931642", # android-18
        "1209214391086485524", # android-21
        "1209493577084960838", # ai-hoshino
        "1209214464684073040", # bulma
        "1209214502294392842", # boa-hancock
        "1209215169721278476", # chi-chi
        "1209214583772946522", # fubuki
        "1209215248792555540", # hinata
        "1209214685379960862", # hayasaka-ai
        "1209214757551341570", # himeno
        "1209214942654496778", # jolyne-cujoh
        "1209214845564620820", # kobeni
        "1246589173385793649", # komi-shouko
        "1246590413062541484", # komi-shuuko
        "1209215123256905739", # makima
        "1209493388190163024", # marin-kitagawa
        "1209215367843545088", # mirko
        "1244407410844504086", # miss-heed
        "1209215458264490025", # mitsuri
        "1241407323814101143", # ms-nadia
        "1209215518175920178", # nami
        "1209215589386559581", # nico-robin
        "1209215693795627028", # shinobu
        "1246587568594882590", # samus
        "1209215299619000421", # sakura
        "1209215761101619230", # tsunade
        "1245513329422630972", # yoru_mac
        "1209215854445592587", # yor-forger
        "1209997833583861860" # zelda
]

FutanariandFemboysList = [
      "1209207047522881636", # futanari
        "1209596163146252298", # femboys
        "1209638729522745395", # faf-gifs
        "1209628517503991878", # faf-vids
        "1244418215388647436", # faf-ass
        "1211353407479226398", # faf-autopaizuri
        "1209595885848367114", # faf-bulge
        "1244774509609750678", # faf-bdsm
        "1245515049645375549", # faf-blowjob
        "1244415248598044742", # faf-cum
        "1209595824586231869", # faf-cumshots
        "1237543049962324049", # faf-caged 
        "1244774575280095324", # faf-docking
        "1303825159886733343", # faf-frotting
        "1244418347832053981", # faf-fucking 
        "1246471947546792076", # faf-gangbang
        "1244774193329995816", # faf-horsecock
        "1209629556668112926", # faf-kemonomimi
        "1257709780231782580", # faf-masturbation
        "1209596337281048618", # faf-monster
        "1215354330904002681", # faf-nuns
        "1246472939558277211", # faf-pregnant
        "1301299815896055950", # faf-small-pp
        "1213248525354409984", # faf-tentacle
        "1244425675218092032", # faf-toys
        "1209595965103673355" # faf-selfsuck
]

MythsandFantasyList = [
        "1301680680404648036", # alien
        "1216858542246727771", # angels
        "1240722373301501963", # bird-girls
        "1240752434163482726", # beast
        "1299820166401622026", # centaur
        "1240720778555687004", # demons
        "1240722742496591963", # dragon
        "1209206935107272786", # ♀elfs
        "1246473882613973082", # fairy
        "1254087033245405235", # giants
        "1209989124459601930", # goblins
        "1241054682424541267", # horns-antlers
        "1209207373546389534", # kemonomimi
        "1240721231704096848", # ⚔knights
        "1240721080768008354", # ♀mages
        "1217165670211518524", # monster
        "1240721024555946055", # mythology
        "1240721629454139555", # minotaur
        "1216155487108726824", # mermaids
        "1240722586157977640", # orc
        "1240721822841049180", # phantom
        "1209207714031607929", # succubus
        "1209981869685215274", # slime-girls
        "1254086916761059378", # vampire
        "1256334583729754154" # scp
]

FurryList = [
        "1209594850996129862", # furry-vids
        "1209595138737967175", # furry-gifs
        "1244399640410067005", # furry-ass
        "1244401024832241674", # furry-anal
        "1244399725713686590", # furry-boobs
        "1244399387208061048", # furry-bdsm
        "1244407148599971920", # furry-bbw
        "1244403960308039690", # furry-cum
        "1209596035316584448", # furry-futa
        "1257087236302831686", # furry-femboys
        "1244400190358814770", # furry-thicc
        "1244399889585143818", # furry-tentacle
        "1244402290895360060", # furry-vanilla
        "1209624833168769026", # pokemon
        "1209625111095943268", # palworld
        "1223742329836408842", # my-little-pony
        "1216775770555547658" # five-nights-at-freddys
]

GamesList = [
        "1210618479879921784", # apex-legends
        "1226590465307185182", # bioshock
        "1232465752586588210", # baldurs-gate
        "1210618071996436541", # cult-of-the-lamb
        "1233497835991994409", # borderlands
        "1216060068710322258", # cyberpunk-2077
        "1209247039444099132", # ddlc
        "1252631284824412180", # dead-by-daylight
        "1209982488731193515", # dead-or-alive
        "1223039008108707962", # elden-ring
        "1217570369180008498", # fire-emblem
        "1209981179449704518", # final-fanatsy
        "1209208238151831623", # fortnite
        "1232410853324623982", # fallout
        "1209208316564086885", # geshin-impact
        "1291530870238478436", # hoyoverse-games
        "1299061448676216922", # tomb-raider
        "1237388185114382397", # the-last-of-us
        "1302773738156064819", # the-first-descendant
        "1209208434902306896", # league-of-legends
        "1209982064850374706", # mario
        "1232745411349839975", # minecraft
        "1209208511708266526", # nier-automata
        "1209208272343539822", # overwatch
        "1300118618469564437", # rayman
        "1211696190912208926", # resident-evil
        "1220724186947780678", # uncharted
        "1218672870645825546", # witcher
        "1209273140660670464" # street-fighter
]

IRLList = [
        "1209593938185297931", # random-irl
        "1209593968845922314", # vids
        "1209593992459583549", # gifs
        "1223038763115089993", # ass
        "1223039430957469897", # anal
        "1223038840051335211", # boobs
        "1223039126731755621", # blow-job
        "1223039929144184923", # cum
        "1223039707706036295", # cosplay
        "1223054042360713267", # chubby
        "1223039516668067910", # milf
        "1223040377414746215", # pregnant
        "1223049653285556244", # lesbian
        "1294060977318527019", # tomboys
        "1242549212000944148", # toys
        "1261443723997479024", # handjob
        "1263907739323727972", # goth
        "1294061006779060359" # squirt
]

OtherIRLList = [
        "1209973215053615155", # femboys
        "1209973102851784815", # trans
        "1209973159277633607", # trans-vids
        "1209973190978445404", # trans-gif
        "1255299607559143475", # anal
        "1255919468127977492", # bulge
        "1297697718256537671", # crossplay-cosplay
        "1255299628253839411", # cum
        "1250223250391433216", # caged
        "1255301715129929748" # wiggle
]

def HentaiTags():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(HentaiTagsList)
            name = name + randomwords
            return name

def Anime():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(AnimeList)
            name = name + randomwords
            return name
    
def CartoonsandComics():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(CartoonsandComicsList)
            name = name + randomwords
            return name
    
def MarvelComics():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(MarvelComicsList)
            name = name + randomwords
            return name

def DCComics():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(DCComicsList)
            name = name + randomwords
            return name
    
def StarWars():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(StarWarsList)
            name = name + randomwords
            return name
    
def ExtremeTags():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(ExtremeTagsList)
            name = name + randomwords
            return name
    
def SpecificCharacters():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(SpecificCharactersList)
            name = name + randomwords
            return name
    
def FutanariandFemboys():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(FutanariandFemboysList)
            name = name + randomwords
            return name
    
def MythsandFantasy():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(MythsandFantasyList)
            name = name + randomwords
            return name
    
def Furry():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(FurryList)
            name = name + randomwords
            return name

def Games():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(GamesList)
            name = name + randomwords
            return name

def IRL():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(IRLList)
            name = name + randomwords
            return name
    
def OtherIRL():
    randomnumber = random.randint(1, 1)
    name = ""
    for x in range(randomnumber):
            randomwords = random.choice(OtherIRLList)
            name = name + randomwords
            return name