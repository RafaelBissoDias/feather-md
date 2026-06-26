import { CircleHelp, Download, FolderOpen, Globe, Lock, MousePointer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

function Section({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-medium text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="space-y-1.5 pl-6 text-sm text-muted-foreground">{children}</div>
    </div>
  )
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CircleHelp className="size-5 text-primary" />
            About FeatherMD
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="space-y-6 pb-2 text-sm">

            <Section icon={<MousePointer className="size-4" />} title="How to use">
              <p><strong className="text-foreground">Editor</strong> — write Markdown on the left panel. Preview updates in real time on the right.</p>
              <p><strong className="text-foreground">Open file</strong> — click the file icon in the toolbar to open a single <code className="rounded bg-muted px-1">.md</code> file.</p>
              <p><strong className="text-foreground">Open folder</strong> — click the folder icon to load an entire directory. A sidebar appears with all your files (Chrome / Edge only).</p>
              <p><strong className="text-foreground">Save</strong> — <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl+S</kbd> or the save icon. When a folder is open, saves directly to the file. Otherwise, downloads a copy.</p>
            </Section>

            <Section icon={<FolderOpen className="size-4" />} title="Folder sidebar">
              <p>When a folder is open you can create, open, and delete <code className="rounded bg-muted px-1">.md</code> files from the sidebar — similar to Obsidian.</p>
              <p>Changes are saved directly to your disk. No upload, no cloud.</p>
            </Section>

            <Section icon={<Lock className="size-4" />} title="Security">
              <p>FeatherMD runs entirely in your browser. <strong className="text-foreground">No data is ever sent to a server.</strong></p>
              <p>Folder access uses the browser's File System Access API. Your browser enforces the sandbox — the app can only read the folder you explicitly chose.</p>
              <p>All Markdown rendering is sanitized with <strong className="text-foreground">DOMPurify</strong> to prevent script injection from malicious files.</p>
            </Section>

            <Section icon={<Download className="size-4" />} title="Install as desktop app">
              <p>FeatherMD is a PWA — you can install it on your desktop without an app store.</p>
              <p>In Chrome or Edge, click the <strong className="text-foreground">install icon</strong> in the address bar (or browser menu → "Install FeatherMD").</p>
              <p>Once installed, it works offline and behaves like a native app.</p>
            </Section>

            <Section icon={<Globe className="size-4" />} title="Browser compatibility">
              <p><strong className="text-foreground">Chrome / Edge</strong> — full support, including folder sidebar.</p>
              <p><strong className="text-foreground">Brave</strong> — disable Shields for this site to enable folder access.</p>
              <p><strong className="text-foreground">Firefox / Safari</strong> — single file mode only (folder sidebar unavailable).</p>
            </Section>

          </div>
        </ScrollArea>

        <div className="flex justify-end pt-2">
          <Button onClick={onClose}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
