import { pageWrapper } from "../styles/common";
export default function Footer() {
  return (
    <footer className="bg-[#1d1d1f] text-[#a1a1a6] py-8 text-center text-sm">
      <div className={pageWrapper}>© {new Date().getFullYear()} Animal Rescue Network. All rights reserved.</div>
    </footer>
  );
}