import { motion } from "framer-motion";
import logo from "@/assets/memo-games-logo.png";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } }),
};

const AboutPage = () => (
  <div className="container mx-auto px-4 py-12 min-h-screen max-w-4xl">
    <motion.div
      className="flex flex-col items-center text-center mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        src={logo}
        alt="Memo Games"
        width={100}
        height={100}
        className="rounded-2xl mb-6 ring-4 ring-primary/20"
        whileHover={{ scale: 1.05, rotate: 3 }}
      />
      <h1 className="font-display text-4xl md:text-5xl font-bold glow-text text-foreground mb-4">About Memo Games</h1>
      <p className="text-muted-foreground text-lg max-w-2xl">
        Founded in 2024, Memo Games is an independent game studio dedicated to creating immersive, unforgettable gaming experiences. From our first indie title to our latest production, we've always believed that great games come from great passion.
      </p>
    </motion.div>

    <div className="space-y-8">
      {[
        {
          title: "Our Story",
          content: [
            "Memo Games was born from a shared dream among a small group of passionate gamers and developers who believed that the gaming industry needed a fresh perspective. What started as late-night coding sessions in a cramped apartment has grown into a thriving studio with a dedicated team of artists, designers, programmers, and storytellers.",
            "Our journey began in 2024 when our founders — a group of school friends with backgrounds in computer science, digital art, and interactive media — decided to take the leap and turn their passion project into a full-fledged studio. The name \"Memo Games\" was inspired by the idea that every great game leaves a lasting memory.",
            "From the very beginning, we set out to create games that would challenge conventions and push the boundaries of interactive entertainment. We wanted to craft worlds that felt alive, stories that resonated with players on a deeply personal level, and gameplay mechanics that kept people coming back for more.",
          ],
        },
        {
          title: "Our Mission",
          content: [
            "Our mission is simple yet ambitious: to create gaming experiences that players will remember forever. We believe that games are powerful mediums for storytelling, artistic expression, and human connection.",
            "We are committed to innovation in every aspect of game development. From cutting-edge graphics and immersive sound design to revolutionary gameplay mechanics and compelling narratives, we strive to raise the bar with each new release.",
            "Quality is at the core of everything we do. We take pride in delivering polished experiences that respect our players' time and investment.",
          ],
        },
        {
          title: "Our Team",
          content: [
            "Behind every Memo Games title is a diverse and talented team of individuals who bring unique skills, perspectives, and passions to the table. Our studio is home to veteran developers with industry experience as well as fresh talent with bold new ideas.",
            "Our artists create breathtaking visual worlds. Our programmers build robust, scalable game engines. Our designers craft intricate game systems. And our writers weave rich narratives that give every character and world a sense of depth and purpose.",
            "We foster a culture of creativity, collaboration, and respect. Every team member's voice is heard, and every idea is considered.",
          ],
        },
        {
          title: "Our Values",
          values: [
            { name: "Player First", desc: "Everything we do starts with the player. We listen to our community, value their feedback, and strive to exceed their expectations." },
            { name: "Innovation", desc: "We refuse to settle for the status quo. We are constantly pushing boundaries, experimenting with new ideas, and exploring uncharted territory." },
            { name: "Integrity", desc: "We believe in honesty, transparency, and ethical business practices. We treat our players, partners, and team members with respect and fairness." },
            { name: "Passion", desc: "We are gamers at heart. We play games, we love games, and we live games. This passion fuels everything we do." },
            { name: "Community", desc: "We believe in the power of gaming communities. We actively engage with our players through social media, forums, and events." },
          ],
        },
        {
          title: "Our Vision",
          content: [
            "As we look to the future, we see a world of limitless possibilities. New technologies like virtual reality, augmented reality, cloud gaming, and AI are opening up exciting new frontiers for interactive entertainment.",
            "Memo Games is poised to be at the forefront of this evolution. We are investing in research and development to create even more immersive, engaging, and accessible gaming experiences.",
            "At Memo Games, the journey is just beginning. We have big dreams, bold ideas, and the talent and determination to make them a reality. Thank you for being part of the Memo Games family. The best is yet to come.",
          ],
        },
      ].map((section, sIndex) => (
        <motion.div
          key={section.title}
          className="glass-card p-6 md:p-8 neon-border"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          custom={sIndex}
        >
          <h2 className="font-display text-2xl font-bold text-foreground mb-4 gradient-text">{section.title}</h2>
          {section.content && section.content.map((p, i) => (
            <p key={i} className="text-muted-foreground text-sm leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
          {section.values && (
            <div className="space-y-4">
              {section.values.map((v) => (
                <div key={v.name}>
                  <strong className="text-foreground text-sm">{v.name}:</strong>
                  <span className="text-muted-foreground text-sm ml-1">{v.desc}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  </div>
);

export default AboutPage;
