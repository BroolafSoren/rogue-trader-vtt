using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace VTT.Server.Models
{
    public class Characteristic
    {
        [BsonElement("value")]
        [JsonPropertyName("value")]
        public int Value { get; set; }
        
        [BsonElement("advances")]
        [JsonPropertyName("advances")]
        public int Advances { get; set; }
    }

    public class Skill
    {
        [BsonElement("trained")]
        [JsonPropertyName("trained")]
        public bool Trained { get; set; }
        
        [BsonElement("advances")]
        [JsonPropertyName("advances")]
        public int Advances { get; set; }
    }

    public class Talent
    {
        [BsonElement("id")]
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [BsonElement("name")]
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [BsonElement("description")]
        [JsonPropertyName("description")]
        public string Description { get; set; }
    }

    public class Wounds
    {
        [BsonElement("total")]
        [JsonPropertyName("total")]
        public int Total { get; set; }
        
        [BsonElement("current")]
        [JsonPropertyName("current")]
        public int Current { get; set; }
    }

    public class ExperiencePoints
    {
        [BsonElement("total")]
        [JsonPropertyName("total")]
        public int Total { get; set; }
        
        [BsonElement("spent")]
        [JsonPropertyName("spent")]
        public int Spent { get; set; }
    }

    public class CharacteristicsSet
    {
        [BsonElement("ws")]
        [JsonPropertyName("ws")]
        public Characteristic WS { get; set; }
        
        [BsonElement("bs")]
        [JsonPropertyName("bs")]
        public Characteristic BS { get; set; }
        
        [BsonElement("s")]
        [JsonPropertyName("s")]
        public Characteristic S { get; set; }
        
        [BsonElement("t")]
        [JsonPropertyName("t")]
        public Characteristic T { get; set; }
        
        [BsonElement("ag")]
        [JsonPropertyName("ag")]
        public Characteristic Ag { get; set; }
        
        [BsonElement("int")]
        [JsonPropertyName("int")]
        public Characteristic Int { get; set; }
        
        [BsonElement("per")]
        [JsonPropertyName("per")]
        public Characteristic Per { get; set; }
        
        [BsonElement("wp")]
        [JsonPropertyName("wp")]
        public Characteristic WP { get; set; }
        
        [BsonElement("fel")]
        [JsonPropertyName("fel")]
        public Characteristic Fel { get; set; }
    }

    public class CharacterBackground
    {
        [BsonElement("homeworld")]
        [JsonPropertyName("homeworld")]
        public string Homeworld { get; set; }
        
        [BsonElement("birthright")]
        [JsonPropertyName("birthright")]
        public string Birthright { get; set; }
        
        [BsonElement("lureOfVoid")]
        [JsonPropertyName("lureOfVoid")]
        public string LureOfVoid { get; set; }
        
        [BsonElement("trialsAndTravails")]
        [JsonPropertyName("trialsAndTravails")]
        public string TrialsAndTravails { get; set; }
        
        [BsonElement("motivation")]
        [JsonPropertyName("motivation")]
        public string Motivation { get; set; }
        
        [BsonElement("lineage")]
        [JsonPropertyName("lineage")]
        public string Lineage { get; set; }
        
        [BsonElement("description")]
        [JsonPropertyName("description")]
        public string Description { get; set; }
        
        [BsonElement("notes")]
        [JsonPropertyName("notes")]
        public string Notes { get; set; }
    }

    public class Character
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [BsonElement("_id")]
        [JsonPropertyName("id")]
        public string Id { get; set; }
        
        [BsonElement("name")]
        [JsonPropertyName("name")]
        public string Name { get; set; }
        
        [BsonElement("career")]
        [JsonPropertyName("career")]
        public string Career { get; set; }
        
        [BsonElement("rank")]
        [JsonPropertyName("rank")]
        public string Rank { get; set; }
        
        [BsonElement("characteristics")]
        [JsonPropertyName("characteristics")]
        public CharacteristicsSet Characteristics { get; set; }
        
        [BsonElement("skills")]
        [JsonPropertyName("skills")]
        public Dictionary<string, Skill> Skills { get; set; } = new Dictionary<string, Skill>();
        
        [BsonElement("talents")]
        [JsonPropertyName("talents")]
        public List<Talent> Talents { get; set; } = new List<Talent>();
        
        [BsonElement("wounds")]
        [JsonPropertyName("wounds")]
        public Wounds Wounds { get; set; }
        
        [BsonElement("experiencePoints")]
        [JsonPropertyName("experiencePoints")]
        public ExperiencePoints ExperiencePoints { get; set; }
        
        [BsonElement("background")]
        [JsonPropertyName("background")]
        public CharacterBackground Background { get; set; } = new CharacterBackground();
    }
}