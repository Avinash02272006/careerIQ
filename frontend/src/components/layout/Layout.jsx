import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CommandPalette from "../modals/CommandPalette";
import ExportReportModal from "../modals/ExportReportModal";

export default function Layout({ children }) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-textPrimary selection:bg-accent/20 selection:text-accent">
      <Navbar
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenExportReport={() => setExportModalOpen(true)}
      />
      <main className="flex-1 w-full flex flex-col">{children}</main>
      <Footer />

      {/* Global Modals */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
      <ExportReportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
