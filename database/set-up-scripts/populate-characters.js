// Script to populate MongoDB with initial character data

// Connect to database
db = db.getSiblingDB('roguetrader');

// Clear existing data if needed
db.characters.deleteMany({});

// Define sample characters
const characters = [
  {
    name: "Cornelius Blackthorn",
    career: "Rogue Trader",
    rank: "Master and Commander",
    characteristics: {
      ws: { value: 35, advances: 0 },
      bs: { value: 45, advances: 1 },
      s: { value: 40, advances: 0 },
      t: { value: 40, advances: 0 },
      ag: { value: 35, advances: 0 },
      int: { value: 45, advances: 1 },
      per: { value: 30, advances: 0 },
      wp: { value: 40, advances: 0 },
      fel: { value: 50, advances: 2 }
    },
    skills: {
      "Awareness": { advances: 1, trained: true },
      "Command": { advances: 2, trained: true },
      "Commerce": { advances: 1, trained: true },
      "Deceive": { advances: 1, trained: true },
      "Dodge": { advances: 1, trained: true },
      "Evaluate": { advances: 1, trained: true },
      "Inquiry": { advances: 1, trained: true },
      "Scrutiny": { advances: 1, trained: true }
    },
    talents: [
      {
        id: "tal-1",
        name: "Air of Authority",
        description: "You may re-roll failed Command Tests."
      },
      {
        id: "tal-2",
        name: "Peer (Nobility)",
        description: "You gain a +10 bonus to Fellowship Tests when dealing with nobles."
      },
      {
        id: "tal-3",
        name: "Talented (Commerce)",
        description: "You gain a +10 bonus to all Commerce Tests."
      }
    ],
    wounds: {
      total: 14,
      current: 14
    },
    experiencePoints: {
      total: 5000,
      spent: 3750
    },
    background: {
      homeworld: "Footfall",
      birthright: "Nobility",
      lureOfVoid: "Warrant of Trade",
      trialsAndTravails: "Betrayal",
      motivation: "Profit",
      lineage: "Ancient Noble Family",
      description: "Cornelius Blackthorn comes from a long line of void-farers. His family has held a Warrant of Trade for seven generations, though their fortunes have waxed and waned. After being betrayed by his first officer five years ago, Cornelius has become more cautious but no less ambitious in his pursuit of wealth and power.",
      notes: "Currently seeking information about xenos artifacts in the Koronus Expanse. Has contacts in House Krin."
    }
  },
  {
    name: "Magos Drakus",
    career: "Explorator",
    rank: "Magos",
    homeWorld: "Forge World",
    characteristics: {
      ws: { value: 30, advances: 0 },
      bs: { value: 40, advances: 0 },
      s: { value: 35, advances: 0 },
      t: { value: 45, advances: 1 },
      ag: { value: 30, advances: 0 },
      int: { value: 55, advances: 3 },
      per: { value: 40, advances: 1 },
      wp: { value: 50, advances: 2 },
      fel: { value: 25, advances: 0 }
    },
    skills: {
      "Tech-Use": { advances: 3, trained: true },
      "Awareness": { advances: 2, trained: true },
      "Logic": { advances: 2, trained: true },
      "Medicae": { advances: 1, trained: true },
      "Common Lore (Tech)": { advances: 2, trained: true },
      "Forbidden Lore (Archeotech)": { advances: 2, trained: true },
      "Evaluate": { advances: 1, trained: true }
    },
    talents: [
      {
        id: "tal-4",
        name: "Mechadendrite Use (Utility)",
        description: "You can use a utility mechadendrite to aid in technical tasks."
      },
      {
        id: "tal-5",
        name: "Binary Chatter",
        description: "You can communicate with tech-devices and other Tech-priests using binary code."
      },
      {
        id: "tal-6",
        name: "Technical Knock",
        description: "You can make a Tech-Use test to clear jammed weapons as a Half Action."
      }
    ],
    wounds: {
      total: 12,
      current: 9
    },
    experiencePoints: {
      total: 6000,
      spent: 4500
    },
    background: {
      homeworld: "Scintilla",
      birthright: "Adeptus Mechanicus",
      lureOfVoid: "Quest for Knowledge",
      trialsAndTravails: "Xenos Encounter",
      motivation: "Discovery",
      lineage: "Mars Forgeworld",
      description: "Magos Drakus has replaced over 60% of his organic body with cybernetic enhancements. His quest for knowledge has taken him to the farthest reaches of the Koronus Expanse, where he seeks to uncover lost technology from the Dark Age of Technology. His augmented eyes glow a dull red, and his voice has a mechanical quality.",
      notes: "Particularly interested in studying the Yu'vath artifacts. Has an extensive collection of ancient data-slates."
    }
  },
  {
    name: "Sister Amaryllis",
    career: "Missionary",
    rank: "Sister Famulous",
    homeWorld: "Shrine World",
    characteristics: {
      ws: { value: 35, advances: 0 },
      bs: { value: 30, advances: 0 },
      s: { value: 30, advances: 0 },
      t: { value: 35, advances: 0 },
      ag: { value: 40, advances: 0 },
      int: { value: 40, advances: 0 },
      per: { value: 45, advances: 1 },
      wp: { value: 50, advances: 2 },
      fel: { value: 45, advances: 1 }
    },
    skills: {
      "Charm": { advances: 2, trained: true },
      "Command": { advances: 1, trained: true },
      "Common Lore (Imperial Creed)": { advances: 2, trained: true },
      "Medicae": { advances: 1, trained: true },
      "Scrutiny": { advances: 2, trained: true },
      "Inquiry": { advances: 1, trained: true }
    },
    talents: [
      {
        id: "tal-7",
        name: "Unshakable Faith",
        description: "You gain a +10 bonus to Willpower Tests to resist fear and intimidation."
      },
      {
        id: "tal-8",
        name: "Peer (Ecclesiarchy)",
        description: "You gain a +10 bonus to Fellowship Tests when dealing with members of the Ecclesiarchy."
      },
      {
        id: "tal-9",
        name: "Talented (Charm)",
        description: "You gain a +10 bonus to all Charm Tests."
      }
    ],
    wounds: {
      total: 10,
      current: 10
    },
    experiencePoints: {
      total: 4500,
      spent: 3200
    },
    background: {
      homeworld: "Maccabeus Quintus",
      birthright: "Servant of the Throne",
      lureOfVoid: "Divine Calling",
      trialsAndTravails: "Tested Faith",
      motivation: "Redemption",
      lineage: "Orphaned Child",
      description: "Sister Amaryllis served in the Order of the Sacred Rose before being assigned to accompany a Rogue Trader expedition to spread the Emperor's light to lost human colonies. Her serene demeanor masks an unshakable determination. She bears a small scar on her right cheek from an encounter with heretics in her youth.",
      notes: "Secretly investigating rumors of a chaos cult among the void-born population. Keeps a collection of relics from various worlds."
    }
  }
];

// Insert the characters
db.characters.insertMany(characters);

// Verify insertion
const count = db.characters.countDocuments();
print(`Inserted ${count} characters into the database`);

// Display inserted characters
print('Character names in database:');
db.characters.find({}, {name: 1, career: 1}).forEach(char => {
  print(` - ${char.name} (${char.career})`);
});