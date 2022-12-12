# This program helped to adjust beatmap.txt when I made a manual error

f = open("beatmap.txt","r")
linelist = f.readlines()
print(linelist)

for index, line in enumerate(linelist):
    if index + 1 >= 147:
        newline = line.split()
        if len(newline)>0:
            newline[1] = str(float(newline[1])+4)
            linelist[index] = " ".join(newline)+"\n"

print(linelist)

f_write = open("beatmap.txt","w")
for line in linelist:
    f_write.write(line)