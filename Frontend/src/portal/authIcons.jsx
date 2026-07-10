import {
  EnvelopeSimple,
  LockSimple,
  User as UserPh,
  Eye as EyePh,
  EyeSlash,
  ArrowLeft,
} from "@phosphor-icons/react";

const weight = "regular";

export function MailIcon() {
  return <EnvelopeSimple weight={weight} />;
}

export function LockIcon() {
  return <LockSimple weight={weight} />;
}

export function UserIcon() {
  return <UserPh weight={weight} />;
}

export function EyeIcon() {
  return <EyePh weight={weight} />;
}

export function ArrowLeftIcon() {
  return <ArrowLeft weight={weight} />;
}

export function EyeOffIcon() {
  return <EyeSlash weight={weight} />;
}
