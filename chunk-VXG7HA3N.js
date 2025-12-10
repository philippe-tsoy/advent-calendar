import{L as g,a as n,b as m}from"./chunk-VX6IEPVJ.js";var y=[{day:1,display:"1",message:"Happy December bunbun! Here is a lil gift for you, your own advent calendar! I hope you enjoy it!",imagePath:"assets/images/day-1.jpg"},{day:2,display:"2",message:`Your arms like a garland, your eyes like a star 
 My dear, hold me closely and brighten my heart! `,imagePath:"assets/images/day-2.jpg"},{day:3,display:"3",message:`From Europe to Asia, from Asia to Europe, 
 Summer or Winter, our side-quests are plural 
 You're bright like the day, and you're shining like night 
 Each instant with you is a lasting delight`,imagePath:"assets/images/day-3.jpg"},{day:4,display:"4",message:`I took your gaze and embraced it, 
 Your face in my face. Did 
 A moth try to love a street lamp? 
 The blaze felt amazing 
 It coddled, embraced me 
 The radiance welcomed the knight 
 Shaw!`,imagePath:"assets/images/day-4.jpg"},{day:5,display:"5",message:`Some tea for the tea pet, some tea for my bunny 
 The custom's antique but the gesture is homely 
 A peak through the mirror, I'm shy so don't scold me 
 My love did lay dormant, hibernated coldly 
 But then winter left and spring crawled in slowly 
 And summer confirmed that you're my one and only!`,imagePath:"assets/images/day-5.jpg"},{day:6,display:"6",message:`You stole a kiss from me and left just the lipstick 
 A glimpse of the passion, its shadow screams "Miss me!" 
 Its specter still wails in the walls of the airport 
 So I will dispell the ill will that it harbors 
 I left a few times, through the sky, through the land 
 But always returned 'cause I'm a boomerang! 
 I promise I'll be back, I'll fuse to your hand 
 And spin you around and kiss you again`,imagePath:"assets/images/day-6.jpg"},{day:7,display:"7",message:`Two lovedoves went hiding in Broek in Waterland 
 Sheep, fields, canals, and a barge at the other end 
 Night walk and sunrise, nothing felt amiss 
 A warm bath, a big bed, a horse in the mist`,imagePath:"assets/images/day-7.jpg"},{day:8,display:"8",message:`The plaza is empty, so let's take a selfie 
 Pretty blue coat and my sweater in mandarin
 Let's juxtapose both supporting and bantering 
 I opened the door to my heart so please enter in 
 Act like you're home, leave your things all around the place 
 They'll keep me going when my thoughts will interlace 
 Intimate kisses will mix with hand-holding 
 You are my missus, my one and my only`,imagePath:"assets/images/day-8.jpg"},{day:9,display:"9",message:`Come be my partner for this life-long ball 
 There will be flowers and kisses for all 
 Give me a bow, and a twirl, and a dance 
 I'll lift you up - the whole world in my hands`,imagePath:"assets/images/day-10.jpg"},{day:10,display:"10",message:`You biked while I ran, united in freeing 
 Ourselves from the curse labeled time 
 The lamp posts were bright, but I couldn't see them 
 Your big eyes left me paralyzed 
 Medusa, my best friend, please take this Ambrosia 
 Oh Zeus, why did your lighting strike? 
 Aphrodite's sons: one wields bow, one wields phobia 
 Only one of them led me right`,imagePath:"assets/images/day-9.jpg"},{day:11,display:"11",message:`Voice sweet like Eurydice and quill of Hermes 
`,imagePath:"assets/images/day-11.jpg"},{day:12,display:"12",message:"Day 12: Twinkling lights! \u{1F4A1}",imagePath:"assets/images/day-12.jpg"},{day:13,display:"13",message:"Day 13: Magical moments! \u{1FA84}",imagePath:"assets/images/day-13.jpg"},{day:14,display:"14",message:"Day 14: Cozy evenings! \u{1F3E0}",imagePath:"assets/images/day-14.jpg"},{day:15,display:"15",message:"Day 15: Halfway there! \u{1F3AF}",imagePath:"assets/images/day-15.jpg"},{day:16,display:"16",message:"Day 16: Winter wonderland! \u{1F328}\uFE0F",imagePath:"assets/images/day-16.jpg"},{day:17,display:"17",message:"Day 17: Festive fun! \u{1F38A}",imagePath:"assets/images/day-17.jpg"},{day:18,display:"18",message:"Day 18: Holiday hugs! \u{1F917}",imagePath:"assets/images/day-18.jpg"},{day:19,display:"19",message:"Day 19: Merry memories! \u{1F4F8}",imagePath:"assets/images/day-19.jpg"},{day:20,display:"20",message:"Day 20: Sweet surprises! \u{1F370}",imagePath:"assets/images/day-20.jpg"},{day:21,display:"21",message:"Day 21: Joyful journey! \u{1F682}",imagePath:"assets/images/day-21.jpg"},{day:22,display:"22",message:"Day 22: Cozy comfort! \u{1F9E6}",imagePath:"assets/images/day-22.jpg"},{day:23,display:"23",message:"Day 23: Almost there! \u23F0",imagePath:"assets/images/day-23.jpg"},{day:24,display:"24",message:"Day 24: Christmas Eve! \u{1F384}",imagePath:"assets/images/day-24.jpg"},{day:25,display:"25",message:"Merry Christmas! \u{1F385}",imagePath:"assets/images/day-25.jpg"},{day:26,display:"26",message:"Day 26: Boxing Day! \u{1F4E6}",imagePath:"assets/images/day-26.jpg"},{day:27,display:"27",message:"Day 27: Holiday continues! \u{1F381}",imagePath:"assets/images/day-27.jpg"},{day:28,display:"28",message:"5 days to New Year! \u{1F389}",imagePath:"assets/images/day-28.jpg"},{day:29,display:"3 days to New Year!",message:"4 days to New Year! \u{1F389}",imagePath:"assets/images/day-29.jpg"},{day:30,display:"2 days to New Year!",message:"3 days to New Year! \u{1F389}",imagePath:"assets/images/day-30.jpg"},{day:31,display:"1 day to New Year!",message:"2 days to New Year! \u{1F389}",imagePath:"assets/images/day-31.jpg"},{day:32,display:"Happy New Year!",message:"Happy New Year! \u{1F389}",imagePath:"assets/images/day-32.jpg"}];var r=class d{STORAGE_KEY="advent-calendar-custom-data";getDayData(a){let e=this.getCustomData().find(i=>i.day===a);if(e)return e;let t=y.find(i=>i.day===a);return t?{day:t.day,display:t.display,message:t.message,imagePath:t.imagePath}:{day:a,message:`Day ${a}`,imagePath:""}}getAllDays(){let a=this.getCustomData(),s=[];for(let e=1;e<=32;e++){let t=a.find(i=>i.day===e);if(t)s.push(t);else{let i=y.find(o=>o.day===e);i?s.push({day:i.day,display:i.display,message:i.message,imagePath:i.imagePath}):s.push({day:e,message:`Day ${e}`,imagePath:""})}}return s}saveDayData(a){let s=this.getCustomData(),e=s.findIndex(t=>t.day===a.day);e>=0?s[e]=n({},a):s.push(n({},a)),localStorage.setItem(this.STORAGE_KEY,JSON.stringify(s))}deleteDayData(a){let e=this.getCustomData().filter(t=>t.day!==a);localStorage.setItem(this.STORAGE_KEY,JSON.stringify(e))}getCustomData(){let a=localStorage.getItem(this.STORAGE_KEY);if(a)try{return JSON.parse(a).map(e=>m(n({},e),{day:typeof e.day=="number"?e.day:Number(e.day)}))}catch{return[]}return[]}getImageUrl(a){return a.imageData?a.imageData:a.imagePath}static \u0275fac=function(s){return new(s||d)};static \u0275prov=g({token:d,factory:d.\u0275fac,providedIn:"root"})};export{r as a};
