import {
  House,
  ClipboardText,
  Sparkle,
  Wallet,
  Receipt,
  FolderOpen,
  Star,
  Bell,
  CheckSquare,
  Image as ImageIconPh,
  ChartBar,
  Shield,
  Users,
  UserCircle as UserCirclePh,
  Palette as PalettePh,
  FileText,
} from "@phosphor-icons/react";

const weight = "regular";

export function ClipboardIcon() {
  return <ClipboardText weight={weight} />;
}

export function ReceiptIcon() {
  return <Receipt weight={weight} />;
}

export function FolderIcon() {
  return <FolderOpen weight={weight} />;
}

export function StarIcon() {
  return <Star weight={weight} />;
}

export function BellIcon() {
  return <Bell weight={weight} />;
}

export function CheckSquareIcon() {
  return <CheckSquare weight={weight} />;
}

export function ImageIcon() {
  return <ImageIconPh weight={weight} />;
}

export function BarChartIcon() {
  return <ChartBar weight={weight} />;
}

export function ShieldIcon() {
  return <Shield weight={weight} />;
}

export function UsersIcon() {
  return <Users weight={weight} />;
}

export function HomeIcon() {
  return <House weight={weight} />;
}

export function SparkleIcon() {
  return <Sparkle weight={weight} />;
}

export function WalletIcon() {
  return <Wallet weight={weight} />;
}

export function UserCircleIcon() {
  return <UserCirclePh weight={weight} />;
}

export function PaletteIcon() {
  return <PalettePh weight={weight} />;
}

export function DocumentReportIcon() {
  return <FileText weight={weight} />;
}

export const NAV_ICONS = {
  dashboard: HomeIcon,
  requests: ClipboardIcon,
  assessments: SparkleIcon,
  account: WalletIcon,
  quotations: ReceiptIcon,
  projects: FolderIcon,
  feedback: StarIcon,
  notifications: BellIcon,
  tasks: CheckSquareIcon,
  "design-files": ImageIcon,
  analytics: BarChartIcon,
  security: ShieldIcon,
  clients: UsersIcon,
  "professional-background": ClipboardIcon,
  "designer-monitor": SparkleIcon,
  staff: UsersIcon,
  compensation: WalletIcon,
  "home-controller": HomeIcon,
  reports: DocumentReportIcon,
};
