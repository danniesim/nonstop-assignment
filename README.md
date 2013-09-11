nonstop-assignment
==================

Implement HTML5 prototype that shows basic animation and implements convincing illusion of movement.

Requirements
------------
* Object must show some animation to indicate movement to direction. For example if ball it could have stripe that is animated during movement.
* Background has to show movement in sync with Object
* Make acceleration and slow down smooth
* Object can not go over the game area borders
* Take care of the browser resize (and orientation change in mobile as you see appropriate)
* You can use any pictures or construct graphics dynamically
* The red continuous line drawn during the drag does not need to be cleared
* The red line must be drawn under the ball


Methodology
-----------
### The Ball
* Ball is rendered as quasi-3D, two n-sided polygons drawn to simulate a rolling ball, polygon points are calculated with classical 3D ops.
* Did some tests on 3D texture mapped spheres for the ball, FPS unusable.
* Tried shaded polygons, FPS unstatisfactory.
* Fooled around with sprite animation, preferred silky smooth rotations and low-memory usage.

### Housekeeping
* Things can be made more OOP, but it's just bloat at this point, re-factoring as we add code is the approach I take.
* Code and variable names are made to sound 'English'. Comments are given where additional explanation is needed.
* Can be made better, but done and works is better than perfect.

### Gameplay
* Made speed of ball vary according to distance of given transit, feels good to me, but extra long transits will have slow acelleration unfortunately...
* Decided to erase red line as new line is formed for clarity
* One day, we might have smooth line filtering on the line drawn... ball twitches much when line segments are short.

### Misc
* Firefox had some tiling gaps due to it's engine, just made +1 px titles to fill the gaps.
* Shadow is just a bitmap made in photoshop for more 'artistic' control.

Tested On
---------
Macbook Air:
* Firefox 23.0.1 (OSX 10.8.4)
* Chrome 29.0.1547.65 (OSX 10.8.4)
* Safari 6.0.5 (OSX 10.8.4)

iPad2:
* Safari (iOS 5.1 9B176)
* Chrome 27.0.1453.10 (iOS 5.1 9B176)

iPhone 4S:
* Safari (iOS 6.1.3 10B329)
* Chrome 28.0.1500.12 (iOS 6.1.3 10B329)

iPhone 5:
* Safari (iOS 6.1.4 10B350)
* Chrome 28.0.1500.16 (iOS 6.1.4 10B350)

Samsung Galaxy S3:
* Android Browser (Android 4.1.2)
* Chrome 29.0.1547.72 (Android 4.1.2)

Notes:
iOS 5.1 9B176 has orientation change/resize bug, might not call resize callback at times.


Additional Thoughts
------------------
Can be optimized more, a good number of floating point ops can be reduced.

Had loads fun doing this, there's something magical about a ball rolling on a patch of grass at the whim of your finger.

Thanks for the assignment!


Daniel Sim
