#import cv2
#import numpy as np
#from PIL import Image
from colorthief import ColorThief
import mss
import mss.tools

sct = mss.mss()
mon = sct.monitors[1]

print(sct.monitors)

monitor = {
        "top": mon["top"] + mon["height"] // 2,
        "left": mon["left"] + mon["width"] // 2,
        "width": mon["width"] // 2,
        "height": mon["height"] // 2,
        "mon": 2
        }

filename = "sct.png"

sct_img = sct.grab(monitor)
mss.tools.to_png(sct_img.rgb, sct_img.size, output=filename)

color_thief = ColorThief(filename)
print(color_thief.get_color(quality=1))

    #frame = Image.frombytes('RGB', sct_img.size, sct_img.bgra, "raw", "BGRX") 
    #frame = np.array(frame)

    #cv2.imshow('a crop of the screen', frame)
    #if cv2.waitKey(1) & 0xFF == ord('q'):
    #    break
