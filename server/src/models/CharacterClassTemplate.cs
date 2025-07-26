using System.Collections.Generic;
using System.Text.Json.Serialization; // Required for JsonPropertyName if needed later

namespace VTT.Server.Models
{
    // Represents the entire structure of a Class JSON file
    public class CharacterClassTemplate
    {
        // These are added by the loading service, not present in the source JSON file itself
        [JsonIgnore] // Don't try to serialize/deserialize these from the main class file
        public string Alias { get; set; } = string.Empty;
        [JsonIgnore]
        public string DisplayName { get; set; } = string.Empty;


        [JsonPropertyName("Special-Abilities")] // Match JSON hyphen if needed by serializer
        public ClassSpecialAbilityInfo SpecialAbilities { get; set; } = new();

        public StartingPackage Starting { get; set; } = new();

        public Dictionary<string, List<int>> CharacteristicAdvances { get; set; } = new();

        public List<RankAdvance> RankAdvances { get; set; } = new();
    }

    public class StartingPackage
    {
        public List<string> Skills { get; set; } = new();
        public List<string> Talents { get; set; } = new();
        public GearPackage Gear { get; set; } = new();
        public List<string>? Traits { get; set; } // Optional list for Traits (like Explorator)
    }

    public class GearPackage
    {
        public List<List<GearItem>> Choices { get; set; } = new();
        public List<string> Fixed { get; set; } = new();
    }

    // Flexible GearItem to handle different properties
    public class GearItem
    {
        public string Name { get; set; } = string.Empty;
        public string? Craftsmanship { get; set; } // Optional, default handled by rule

        // Optional fields for specific cases like Arch-Militant
        public string? Class { get; set; }
        public string? Type { get; set; }
        public int? Quantity { get; set; }
        public List<string>? Upgrades { get; set; }
    }

    public class RankAdvance
    {
        public int Rank { get; set; }
        public int SkillCost { get; set; }
        public List<string> Skills { get; set; } = new();
        public List<TalentAdvance> Talents { get; set; } = new();
        public SkillCostException? Exceptions { get; set; } // Optional field for exceptions
    }

    public class TalentAdvance // Represents a talent available at a specific rank
    {
        public string Name { get; set; } = string.Empty;
        public int Cost { get; set; }
        // Note: Prerequisites are NOT stored here per user request, they are in the central Talent data
    }

    public class SkillCostException // For Void-Master Rank 2 exception
    {
        public int SkillCost { get; set; }
        public List<string> Skills { get; set; } = new();
    }

    public class ClassSpecialAbilityInfo
    {
        public string Type { get; set; } = string.Empty; // "solo", "list", "choice"
        public List<AbilityDetail> Abilities { get; set; } = new();
    }

    public class AbilityDetail
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    // --- Models (e.g., in Models/TalentData/Talent.cs or separate files) ---

    // Represents the structure of the central talents.json file
    public class TalentDefinition
    {
        public string Name { get; set; } = string.Empty;
        public List<BasePrerequisite> Prerequisites { get; set; } = new(); // Using inheritance for prereqs
        public string Description { get; set; } = string.Empty; // Renamed from 'Effect' for clarity
        public List<string>? TalentGroups { get; set; } // Optional field for talent groups
        public string? Sourcebook { get; set; } // Optional
        public int? Page { get; set; } // Optional
    }

    // Base class for Prerequisites, using discriminator for OR logic (Option 2)
    [JsonPolymorphic(TypeDiscriminatorPropertyName = "Type")] // Helps System.Text.Json know which type to create
    [JsonDerivedType(typeof(AttributePrerequisite), typeDiscriminator: "Attribute")]
    [JsonDerivedType(typeof(SkillPrerequisite), typeDiscriminator: "Skill")]
    [JsonDerivedType(typeof(TalentPrerequisite), typeDiscriminator: "Talent")]
    [JsonDerivedType(typeof(TraitPrerequisite), typeDiscriminator: "Trait")]
    [JsonDerivedType(typeof(PrerequisiteChoice), typeDiscriminator: "PrerequisiteChoice")] // Our custom type for OR
    // Add other known prerequisite types here if needed (e.g., "PsyRating", "Class")
    public abstract class BasePrerequisite
    {
        // Common property can go here if any, or leave abstract
        // public string Type { get; set; } // Implicitly handled by discriminator
    }

    public class AttributePrerequisite : BasePrerequisite
    {
        public string Name { get; set; } = string.Empty; // e.g., "WS", "Ag", "Fellowship"
        public int Value { get; set; }
    }

    public class SkillPrerequisite : BasePrerequisite
    {
        public string Name { get; set; } = string.Empty; // e.g., "Dodge", "Common Lore (War) +10"
        // Maybe add optional 'MinimumLevel' if needed (e.g., Trained)
    }

    public class TalentPrerequisite : BasePrerequisite
    {
        public string Name { get; set; } = string.Empty; // e.g., "Frenzy", "Melee Weapon Training (Any)"
    }
     public class TraitPrerequisite : BasePrerequisite
    {
        public string Name { get; set; } = string.Empty; // e.g., "Mechanicus Implants"
    }

    // Represents an OR choice among multiple prerequisites
    public class PrerequisiteChoice : BasePrerequisite
    {
        // List of prerequisites where only ONE needs to be met
        public List<BasePrerequisite> Choices { get; set; } = new();
    }

}