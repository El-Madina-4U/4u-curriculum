// Dropdown function
const dropdown = document.getElementById("dropdown-options");

function openDropdown(){
  if (dropdown.classList.contains("open")){
    dropdown.classList.remove("open");    
  } else {
    dropdown.classList.add("open");
  }
    
};

// Constants
const body = document.querySelector("body");
const instruction = document.querySelector("#instruction");
const content = document.querySelector("#content-holder");
const title = document.querySelector("#title");
const slot1 = document.querySelector("#slot-1");
const slot2 = document.querySelector("#slot-2");
const slot3 = document.querySelector("#slot-3");

// Clear function
function clear(){
  body.classList = '';
  
  slot1.classList = 'content';
  
  slot2.classList = 'content';
  
  slot3.classList = 'content';
  
  dropdown.classList.remove("open");
}

// Option 1
function option1(){
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("seventies");

  title.innerHTML = "1970s";

  slot1.classList.add("seventies");
  slot1.innerHTML = "<h1>Fashion</h1> \n \
          <p> \n \
          <strong>Bohemian Chic:</strong> The 1970s saw a rise in bohemian-inspired fashion, characterised by flowing fabrics, floral prints, and earthy colors. This style was influenced by the counterculture movement and embraced a relaxed, free-spirited aesthetic. Fringed vests, peasant blouses, maxi dresses, and bell-bottom jeans were iconic elements of this trend. \n \
          </p> \n \
          <p> \n \
          <strong>Disco Glamour:</strong> The disco era of the 1970s brought about glamorous and flashy fashion. Metallic fabrics, sequins, and glitter were popular, reflecting the vibrant nightlife scene. Tight-fitting clothes such as wrap dresses, jumpsuits, and platform shoes became synonymous with disco fashion. Bold colors and exaggerated silhouettes were key features of this trend. \n \
          </p> \n \
          <p> \n \
          <strong>Sporty Casual:</strong> The 1970s also witnessed the emergence of sporty casual wear, influenced by the rising popularity of recreational activities like jogging and aerobics. This style featured comfortable yet stylish clothing such as tracksuits, hoodies, sneakers, and t-shirts with bold logos. The athleisure trend of mixing sportswear with everyday attire became increasingly popular during this decade. \n \
          </p>";

  slot2.classList.add("seventies");
  slot2.innerHTML = "<h1>Music</h1> \n \
          <p> \n \
            <strong>Disco Fever:</strong> The 1970s were defined by the disco music craze, characterised by pulsating rhythms, funky basslines, and catchy melodies. Disco songs often featured lush orchestrations, soulful vocals, and lyrics about love, dancing, and nightlife. The disco era saw the rise of iconic artists like Donna Summer, Bee Gees, and Gloria Gaynor, as well as legendary clubs like Studio 54, where disco culture thrived. \n \
          </p> \n \
          <p> \n \
            <strong>Rock 'n' Roll Evolution:</strong> Rock music underwent significant evolution in the 1970s, branching into various subgenres such as glam rock, progressive rock, and punk rock. Bands like Led Zeppelin, Pink Floyd, and The Rolling Stones pushed the boundaries of rock music with experimental sounds and complex compositions. The 1970s also saw the emergence of influential singer-songwriters like Bob Dylan and Joni Mitchell, who infused their music with introspective lyrics and folk influences. \n \
          </p> \n \
          <p> \n \
            <strong>Birth of Hip-Hop:</strong> The 1970s marked the birth of hip-hop music in the Bronx, New York City, as DJs and MCs began experimenting with turntables and rhymes at block parties and community events. Hip-hop's early pioneers, such as Grandmaster Flash, Afrika Bambaataa, and DJ Kool Herc, laid the groundwork for the genre's future success. Breakdancing, graffiti art, and MC battles were integral elements of hip-hop culture during this formative decade. \n \
          </p>";

  slot3.classList.add("seventies");
  slot3.innerHTML = "<h1>Discoveries and Advancements</h1> \n \
          <p> \n \
            <strong>Personal Computing:</strong> The 1970s saw the birth of the personal computer revolution, with the development of groundbreaking technologies like the microprocessor and the floppy disk. Companies like Apple, Microsoft, and IBM introduced early PCs to the market, making computing accessible to individuals and businesses alike. Innovations such as the Altair 8800 and the Apple II paved the way for the digital age, laying the foundation for the modern computer industry. \n \
          </p> \n \
          <p> \n \
            <strong>Genetic Engineering:</strong> In the 1970s, scientists made significant strides in the field of genetic engineering, with the discovery of recombinant DNA technology. This breakthrough allowed researchers to manipulate and splice DNA molecules from different organisms, opening up new possibilities for biotechnology and genetic research. The creation of the first genetically modified organism (GMO) in 1973 marked a milestone in genetic engineering, sparking both excitement and ethical debates about the implications of manipulating the building blocks of life. \n \
          </p> \n \
          <p> \n \
            <strong>Space Exploration:</strong> The 1970s were a golden age of space exploration, with landmark achievements such as the Apollo moon landings and the launch of the Voyager probes. NASA's Apollo program successfully put twelve astronauts on the lunar surface between 1969 and 1972, fulfilling President Kennedy's goal of landing a man on the moon before the end of the decade. The Voyager spacecraft, launched in 1977, conducted pioneering studies of the outer planets and provided invaluable data about the solar system's far reaches. \n \
          </p>";
  localStorage.setItem("choice", "seventies");
}

// Option 2
function option2(){
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("eighties");

  title.innerHTML = "1980s";

  slot1.classList.add("eighties");
  slot1.innerHTML = "<h1>Fashion</h1> \n \
          <p> \n \
            <strong>Punk Rock Rebellion:</strong> The 1980s saw the continuation of punk fashion, characterised by rebellion and DIY aesthetics. Leather jackets adorned with studs and patches, ripped jeans, and band t-shirts were staples of the punk look. Mohawks, spiked hair, and heavy eye makeup were popular among both men and women, reflecting the subversive attitude of the punk movement. \n \
          </p> \n \
          <p> \n \
              <strong>Preppy Style:</strong> Preppy fashion became mainstream in the 1980s, inspired by the collegiate look of Ivy League universities. This style featured clean-cut clothing such as button-down shirts, cable-knit sweaters, khaki pants, and plaid skirts. Pastel colors and bold stripes were commonly seen in preppy attire, along with accessories like boat shoes, pearl necklaces, and headbands. \n \
          </p> \n \
          <p> \n \
              <strong>Power Dressing:</strong> The 1980s witnessed the rise of power dressing, especially among working women, who aimed to assert their authority in the workplace. Power suits with padded shoulders, tailored blazers, and high-waisted trousers became emblematic of this trend. Bold colors, geometric patterns, and statement jewelry were used to exude confidence and professionalism. \n \
          </p> \n \
          <p> \n \
              <strong>New Wave Fashion:</strong> New Wave music heavily influenced fashion in the 1980s, giving rise to a futuristic and eclectic style. This aesthetic featured asymmetrical cuts, bright neon colors, and unconventional silhouettes. Fishnet stockings, leather skirts, and oversized blazers were popular items in the New Wave wardrobe. Hairstyles like the mullet and the asymmetrical bob complemented this edgy and avant-garde look. \n \
          </p>";
  slot2.classList.add("eighties");
  slot2.innerHTML = "<h1>Music</h1> \n \
          <p> \n \
            <strong>Pop Dominance:</strong> The 1980s were characterised by the rise of pop music as a dominant force in the mainstream. Synthesizers, drum machines, and electronic production techniques became prevalent, shaping the sound of '80s pop hits. Iconic artists like Michael Jackson, Madonna, and Prince achieved unprecedented success with their catchy melodies, flashy music videos, and larger-than-life personas. The MTV generation further propelled pop music into the spotlight, as music videos became a crucial marketing tool for artists. \n \
          </p> \n \
          <p> \n \
            <strong>New Wave Revolution:</strong> New Wave music emerged in the late 1970s and reached its peak popularity in the 1980s, blending elements of punk rock, electronic music, and avant-garde art. Bands like Depeche Mode, Duran Duran, and The Cure embraced synthesizers and drum machines to create a futuristic and eclectic sound. New Wave songs often featured catchy hooks, danceable rhythms, and introspective lyrics, reflecting the angst and optimism of youth culture in the '80s. \n \
          </p> \n \
          <p> \n \
            <strong>Heavy Metal Explosion:</strong> The 1980s witnessed a surge in popularity for heavy metal music, fueled by bands like Metallica, Iron Maiden, and Guns N' Roses. Known for its loud guitars, aggressive vocals, and theatrical performances, heavy metal became a cultural phenomenon in the '80s. Subgenres like thrash metal, glam metal, and hair metal attracted legions of dedicated fans, while controversial themes and imagery sparked debates about censorship and morality. \n \
          </p>";
  
  slot3.classList.add("eighties");
  slot3.innerHTML = "<h1>Discoveries and Advancements</h1> \n \
          <p> \n \
            <strong>Personal Computing Boom:</strong> The 1980s witnessed a surge in personal computing, as technological advancements and market demand drove the adoption of PCs worldwide. The introduction of the IBM PC in 1981 set a standard for compatibility and sparked a wave of clones and competitors. Microsoft's MS-DOS operating system became ubiquitous on IBM-compatible computers, laying the groundwork for the dominance of Windows in the future. The graphical user interface (GUI) revolutionized computing with the release of Apple's Macintosh in 1984, making computers more intuitive and user-friendly. \n \
          </p> \n \
          <p> \n \
            <strong>HIV/AIDS Discovery:</strong> The 1980s saw the identification of the human immunodeficiency virus (HIV) as the cause of acquired immunodeficiency syndrome (AIDS), a devastating pandemic that emerged in the early 1980s. Scientists isolated and characterized HIV in 1983, leading to improved understanding of the virus's transmission and pathogenesis. The discovery of HIV paved the way for diagnostic tests, antiretroviral therapies, and public health interventions to combat the spread of AIDS and support affected individuals. \n \
          </p> \n \
          <p> \n \
            <strong>End of the Cold War:</strong> The 1980s marked the end of the Cold War, a decades-long geopolitical conflict between the United States and the Soviet Union. Diplomatic efforts like détente and arms control negotiations helped ease tensions between the superpowers, culminating in the historic events of 1989-1991. The fall of the Berlin Wall in 1989 symbolized the collapse of communism in Eastern Europe, while the dissolution of the Soviet Union in 1991 heralded the end of the bipolar world order and the beginning of a new era of global politics. \n \
          </p>";
  localStorage.setItem("choice", "eighties");
}

// Option 3
function option3(){
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("nineties");

  title.innerHTML = "1990s";

  slot1.classList.add("nineties");
  slot1.innerHTML = "<h1>Fashion</h1> \n \
          <p> \n \
            <strong>Grungy Chic:</strong> The 1990s saw the rise of grunge fashion, influenced by the music scene in Seattle and characterised by its casual, unkempt aesthetic. Flannel shirts, ripped jeans, combat boots, and band t-shirts were emblematic of the grunge look. Layering was key, with oversized sweaters worn over t-shirts and topped with a denim jacket. This anti-establishment style rejected the flashy excess of the 1980s in favor of a more laid-back and authentic vibe. \n \
          </p> \n \
          <p> \n \
            <strong>Minimalist Elegance:</strong> Minimalism emerged as a dominant trend in 1990s fashion, characterised by clean lines, neutral colors, and understated sophistication. Simple silhouettes such as slip dresses, tailored blazers, and high-waisted trousers were favored by minimalist fashionistas. Fabrics like silk, satin, and cashmere added a touch of luxury to the minimalist wardrobe, while accessories were kept minimal to maintain a sleek and refined look. \n \
          </p> \n \
          <p> \n \
            <strong>Retro Revival:</strong> The 1990s witnessed a resurgence of interest in fashion from past decades, particularly the 1960s and 1970s. This retro revival manifested in trends like babydoll dresses, platform shoes, and psychedelic prints. Vintage clothing stores became popular destinations for fashion enthusiasts seeking unique and nostalgic pieces. Mixing and matching vintage items with contemporary staples allowed individuals to express their individuality while paying homage to fashion history. \n \
          </p> \n \
          <p> \n \
            <strong>Streetwear Culture:</strong> Streetwear culture flourished in the 1990s, fueled by the rise of hip-hop and urban youth subcultures. Baggy jeans, oversized hoodies, and graphic t-shirts became iconic elements of streetwear fashion. Sneakers played a crucial role in street style, with brands like Nike and Adidas dominating the market. Bold logos, graffiti-inspired graphics, and sporty accents were hallmarks of streetwear brands, reflecting the influence of urban culture on mainstream fashion. \n \
          </p>";
  slot2.classList.add("nineties");
  slot2.innerHTML = "<h1>Music</h1> \n \
          <p> \n \
            <strong>Grunge Revolution:</strong> The 1990s saw the rise of grunge music as a reaction against the commercialization of rock music in the '80s. Bands from Seattle, such as Nirvana, Pearl Jam, and Soundgarden, spearheaded the grunge movement with their raw, angst-ridden sound and DIY ethos. Grunge songs often featured distorted guitars, mumbled vocals, and introspective lyrics, reflecting the disillusionment and alienation of Generation X. \n \
          </p> \n \
          <p> \n \
            <strong>Hip-Hop Golden Age:</strong> The 1990s are often regarded as the golden age of hip-hop, as the genre exploded in popularity and diversity. East Coast artists like Wu-Tang Clan, Notorious B.I.G., and Nas brought gritty storytelling and lyrical prowess to the forefront, while West Coast rappers like Tupac Shakur and Dr. Dre pioneered gangsta rap with its tales of street life and social commentary. The 1990s also saw the rise of alternative hip-hop, with groups like A Tribe Called Quest and De La Soul blending jazz, funk, and conscious lyrics. \n \
          </p> \n \
          <p> \n \
            <strong>Electronic Dance Music (EDM) Emergence:</strong> The 1990s witnessed the emergence of electronic dance music (EDM) as a global phenomenon, with genres like house, techno, and trance gaining widespread popularity. DJs and producers like Daft Punk, The Chemical Brothers, and Fatboy Slim pushed the boundaries of electronic music, incorporating futuristic sounds and infectious beats into their compositions. Raves and dance clubs became hubs of EDM culture, where revelers could immerse themselves in a euphoric and transcendental experience. \n \
          </p>";
  
  slot3.classList.add("nineties");
  slot3.innerHTML = "<h1>Discoveries and Advancements</h1> \n \
          <p> \n \
            <strong>World Wide Web:</strong> The 1990s saw the creation and rapid expansion of the World Wide Web, transforming the way people communicate, access information, and conduct business. In 1990, Tim Berners-Lee invented the hypertext transfer protocol (HTTP) and the first web browser, laying the foundation for the internet as we know it today. The launch of the first commercial web browser, Netscape Navigator, in 1994 popularized the internet among the general public, leading to the dot-com boom and the rise of e-commerce. \n \
          </p> \n \
          <p> \n \
            <strong>Human Genome Project:</strong> The 1990s marked the launch of the Human Genome Project, an international effort to map and sequence the entire human genome. The project aimed to unravel the genetic blueprint of humanity, providing insights into the structure, function, and evolution of our DNA. The completion of the Human Genome Project in 2003 represented a monumental achievement in genetics and paved the way for personalized medicine, genetic testing, and gene therapy. \n \
          </p> \n \
          <p> \n \
            <strong>Cloning of Dolly the Sheep:</strong> In 1996, scientists at the Roslin Institute in Scotland made headlines with the successful cloning of Dolly the Sheep, the world's first cloned mammal. Dolly was created using a technique called somatic cell nuclear transfer, which involved transferring the nucleus of an adult sheep cell into an egg cell and then implanting it into a surrogate mother. Dolly's birth sparked ethical debates about the implications of cloning and raised questions about the nature of genetic identity and reproduction. \n \
          </p>";
  localStorage.setItem("choice", "nineties");
}

// Observers
const slot1observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot1.classList.add("fade-in");
    }
  }
);
slot1observer.observe(slot1);

const slot2observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot2.classList.add("rise-in");
    }
  }
);
slot2observer.observe(slot2);

const slot3observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot3.classList.add("grow-in");
    }
  }
);
slot3observer.observe(slot3);

// Loading event
document.addEventListener("DOMContentLoaded", function () {
  const choice = localStorage.getItem("choice");

  if (choice == "seventies"){
    option1();
  } else if (choice == "eighties"){
    option2();
  } else if (choice == "nineties"){
    option3();
  }
});

// Reset
function reset(){
    clear();
    content.style.display = "";
    instruction.style.display = 'flex';
    localStorage.setItem("choice", "");
}