# MIOJSLibs - Cocoa / Cocoa touch on the web

These libraries are designing to develop a web or web application in the same way like if you develop a native iOS/macOS application.

## **Brief history:**

Nowadays the web is a important part of developing company, specially, if your target are the desktop or laptop computers.

With the new HTML5 and CSS tools you have the option to develop a web app or a native app, but usually the majority companies go web first (and last sometimes), because easy to develop an app in the web (even with different browsers) than develop an app for different OS like Windows, or macOS.

But the way the web works it's totally different from the way native app works, from a perspective of a long native programmer.

Usually, most web programmers don't know anything or at least they don't use delegation, heritance, KVC/KVO, singleton, etc. They don't have the concept of an app, there a lot of webpages, links one to another... 

And it's not a bad thing, if you develop a web, but if you try to develop a huge web app, not only it's important to know all that stuff, it's important to understand when you can use and when you can't use. Of course, you can make one app with only part of this knowledge but in a long term it's going to cost you a lot more troubles updating, change things, adding new feature, etc. But If you make the right decisions, applying all the algorithm in the right way you can maintain a large application with few resources, and that’s what this framework was intended for. Do more with few.

I try a lot of web frameworks, the famous ones, the frameworks from big companies, but, finally, I saw that everyone was designed from a point of view of a web developers... at our company (that we are mainly native developers) was a challenge.

We had to develop a web manager for our customers, and we did. We used frameworks like Angular or React, but in the end, cost us a lot of time and resources make the two teams (web and iOS) work together, specially in the UI section. 

I found that in native applications our designer tweak and polish the final look of the apps…but in the web, the final tweak was made by the programmers, they need to “run” in the browser to see how the UI looks, because the framework runtime that loads the html template. So, if you don’t run in the browser you don’t know how looks like (And we can’t force to our designers to understand what is a runtime…) Of course, there are tools that try to solve these problems, but usually are tools designed only for that framework, so if we need to change, we need to learn new tools.

So, my question back of the days was: Why not use the normal HTML5 and CSS tools available, instead of custom tools for only one framework? Every designer knows how to used, of course, the answer was: Because of the runtime or the interpreter…so, Why I need a runtime to develop dynamic webs? 

With the standards tools for HTML5/CSS I only needed a small wrapper around tags, not a fully runtime, that I needed to download a lot of bytes… just to see the main page of the web.

Also, I needed to develop a fast tutorial beacuse one special person step in our company, she didn’t code before, but she had to learn how an iOS programing works, how to code, how the patterns are used, etc. and Objective-C is really a difficult language for beginners, and swift was not stable by that time, so I decide to start with web tutorials but I need a way of programming like iOS / macOS.

Now in our company all people can swicth between web or native easily

After programing for a lot of environments like desktop or mobile platforms (Windows, macOS, Linux, iOS, Android, etc.) and microcontrollers (company customs libs, RTOS, etc.) I found that the way of Cocoa / Cocoa touch works, brings me the possibility of do much more with less resources. For now, it’s the framework we use in our daily basis even when we code for other platforms.

I want to pointed out something, it’s not about the Cocoa API, it’s how you use it. Things like Views, View Controllers, Notification center, Delegation, KVC/KVO, Gestures, how a Fetch Results Controller works, and so on, the things that make us more productive, not just how you’re app looks like, or how the API can support or not. That’s the thing we like about Cocoa / Cocoa touch

**So, I start this project to solve these things:**

-	The design team needs to see how looks like the view or app with standard HTML5/CSS tools.
-	We don’t want another runtime.
-	The code, should be simple but powerful enough to develop huge web application so we can maintain with few resources
-	All common patterns in native app should be built into the frameworks
-	All teams, can switch between web app and iOS app with ease, because the API works almost the same
- Animation in mind! All mobile and desktop native apps has beautiful transitions/animations. The majority of webs don't have transitions at all. (A transtion/animation informs the user where he was and how to go back, safe you a UI elements specially in mobile apps)


**What is not intend for:**

- It's not a UI framework that looks like iOS / macOS native application.
- It's not a framework that converts the swift or Objective-C code into a web application.
- The classes, functions, etc. are like Cocoa / Cocoa touch but with slight differences to work on the web. It’s not intended to be an exact match, but most of the time are quite similar.
- It's not design to create a simple web page (Of course, you can do it).


## Examples and tutorials:

// TODO: Working on... :)

