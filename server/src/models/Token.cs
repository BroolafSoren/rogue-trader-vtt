namespace RogueTraderVTT.Models
{
    public class Token
    {
        public string Id { get; set; } = "";
        public double X { get; set; }
        public double Y { get; set; }
        public string Color { get; set; } = "";
        public List<Waypoint> Waypoints { get; set; } = new List<Waypoint>();
    }

    public class Waypoint
    {
        public double X { get; set; }
        public double Y { get; set; }
    }
}