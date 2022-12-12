# This program takes beats.txt and beatmap.txt, and laces the values together in tiles.txt
# The server does not ever read beatmap.txt or beats.txt

beats = open("beats.txt", "r")

# Dictionary mapping beats to timestamps
beatarr = {}

for line in beats.readlines():
    beat = line.strip().split()
    if len(beat) > 1:
        beatarr[float(beat[0])] = float(beat[1])

beatmap = open("beatmap.txt", "r")
beatmaparr = []
for line in beatmap.readlines():
    strpline = line.strip().split()
    if strpline:
        beatmaparr.append([int(strpline[0]), float(strpline[1])])

keys = list(beatarr.keys())
keys.sort()

f_timestamps = open("tiles.txt", "w")
for beat in beatmaparr:
    button = beat[0]
    beattime = beat[1]
    for index, key in enumerate(keys):
        if keys[index + 1] >= beattime:
            break
    scale_ratio = (beattime-key) / (keys[index + 1] - keys[index])

    timestamp = beatarr[keys[index]] * (1 - scale_ratio) + beatarr[keys[index + 1]] * scale_ratio

    f_timestamps.write(str(button) + " " + str(timestamp) + "\n")