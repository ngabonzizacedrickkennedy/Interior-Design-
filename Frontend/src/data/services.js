export const SERVICES = [
  {
    slug: "full-home-design",
    title: "Full Home Design",
    description:
      "End-to-end design across every room — space planning, materials, furniture, and styling, managed from first sketch to final install.",
    idealFor: "Homeowners renovating or furnishing an entire property who want one team accountable for the whole result.",
  },
  {
    slug: "single-room-refresh",
    title: "Single Room Refresh",
    description:
      "A focused redesign of one room — typically a living room, bedroom, or home office — resolved in weeks, not months.",
    idealFor: "Anyone with one room that isn't working yet, without the scope or budget of a full home project.",
  },
  {
    slug: "commercial-fit-out",
    title: "Commercial Fit-Out",
    description:
      "Workplace and hospitality fit-outs covering layout, materials, lighting, and furniture procurement, coordinated with your contractor.",
    idealFor: "Businesses opening, relocating, or redesigning an office, studio, or retail space.",
  },
  {
    slug: "design-consultation",
    title: "Design Consultation Only",
    description:
      "A single working session (in person or virtual) to troubleshoot a layout, palette, or sourcing decision you're stuck on.",
    idealFor: "People who mostly know what they want and need an experienced second opinion before committing.",
  },
];

export function getServiceBySlug(slug) {
  return SERVICES.find((service) => service.slug === slug);
}
