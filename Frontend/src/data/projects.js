// TODO: These are stand-in Unsplash photos (free license, no attribution
// required) so the portfolio has real imagery. Swap in actual Space Design
// Group project photography in src/assets/images/ when available, and
// replace this placeholder copy with real project write-ups.
import project1 from "../assets/images/project-1.jpg";
import project2 from "../assets/images/project-2.jpg";
import project3 from "../assets/images/project-3.jpg";
import project4 from "../assets/images/project-4.jpg";
import project5 from "../assets/images/project-5.jpg";
import project6 from "../assets/images/project-6.jpg";

export const PROJECTS = [
  {
    slug: "riverside-loft",
    title: "Riverside Loft",
    year: "2024",
    category: "Residential",
    image: project1,
    gallery: [project1, project2, project3],
    summary: "An open-plan loft reworked around light, storage, and a single long sightline to the river.",
    body: "The brief was simple: stop losing things, and stop the main room feeling like a corridor. We rebuilt the kitchen run along one wall, added a run of full-height joinery that disappears into the architecture, and oriented the seating around the river view instead of the television. Warm oak, plaster walls, and brass fittings carry the material palette through every room.",
  },
  {
    slug: "maple-residence",
    title: "Maple Residence",
    year: "2023",
    category: "Residential",
    image: project2,
    gallery: [project2, project3, project1],
    summary: "A family home renovation focused on resolving flow between kitchen, dining, and garden.",
    body: "This project centered on a single structural move — widening the opening between kitchen and garden — that unlocked the rest of the plan. From there we layered in a considered material palette of limewashed walls, white oak cabinetry, and stone countertops, and resolved years of accumulated storage problems with custom joinery built around how this family actually lives.",
  },
  {
    slug: "hartwell-house",
    title: "Hartwell House",
    year: "2023",
    category: "Residential",
    image: project3,
    gallery: [project3, project4, project2],
    summary: "A full interior refresh for a period property, balancing original detail with a calmer, livable palette.",
    body: "Hartwell House came with beautiful original cornicing and proportions that had been buried under decades of piecemeal updates. We stripped the palette back to a quiet range of neutrals, restored the original detailing, and introduced furniture and lighting that read as contemporary without fighting the architecture.",
  },
  {
    slug: "birchgrove-studio",
    title: "Birchgrove Studio",
    year: "2022",
    category: "Commercial",
    image: project4,
    gallery: [project4, project1, project6],
    summary: "A creative studio fit-out designed to flex between quiet desk work and client presentations.",
    body: "Birchgrove needed one space to do two jobs: focused daily studio work, and the occasional client pitch. We split the floor into a calm working zone and a separate presentation area with better acoustics and lighting control, joined by a shared material language of warm wood and matte black steel.",
  },
  {
    slug: "northgate-offices",
    title: "Northgate Offices",
    year: "2022",
    category: "Commercial",
    image: project5,
    gallery: [project5, project6, project4],
    summary: "A workplace redesign for a 40-person office, prioritizing daylight access and acoustic separation.",
    body: "The existing office buried its best daylight behind private offices along the windows. We flipped the plan, pushing collaborative and informal seating to the perimeter and using glazed, acoustically-treated pods for focused work and calls in the center of the floor.",
  },
  {
    slug: "lakeside-retreat",
    title: "Lakeside Retreat",
    year: "2021",
    category: "Residential",
    image: project6,
    gallery: [project6, project5, project3],
    summary: "A lakeside weekend house furnished to feel finished from the first weekend, not the fifth.",
    body: "With a tight renovation window before the season started, this project moved fast: a single cohesive sourcing pass for furniture, lighting, and textiles, built around a palette that holds up against both bright lake light and low-lit evenings.",
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((project) => project.slug === slug);
}
