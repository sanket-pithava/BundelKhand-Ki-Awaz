import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { uploadMedia } from "@/lib/admin/upload";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Heading1, Heading2, Heading3,
  Link as LinkIcon, Image as ImageIcon, Video, Undo, Redo
} from "lucide-react";
import { toast } from "sonner";
import { useCallback } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        toast.loading("Uploading image...");
        try {
          const url = await uploadMedia(file, "articles");
          editor.chain().focus().setImage({ src: url }).run();
          toast.dismiss();
          toast.success("Image added");
        } catch (error) {
          toast.dismiss();
          toast.error("Failed to upload image");
        }
      }
    };
    input.click();
  }, [editor]);

  const addVideo = useCallback(() => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const toggleLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const MenuButton = ({
    onClick,
    isActive = false,
    disabled = false,
    children,
    title,
  }: any) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded hover:bg-navy/10 disabled:opacity-50 transition-colors ${
        isActive ? "bg-navy/10 text-navy" : "text-navy/60"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-navy/5 border-b border-navy/15 rounded-t-lg">
      <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
        <Bold className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
        <Italic className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strike">
        <Strikethrough className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-5 bg-navy/20 mx-1" />

      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-5 bg-navy/20 mx-1" />

      <MenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} isActive={editor.isActive({ textAlign: "left" })} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} isActive={editor.isActive({ textAlign: "center" })} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} isActive={editor.isActive({ textAlign: "right" })} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} isActive={editor.isActive({ textAlign: "justify" })} title="Justify">
        <AlignJustify className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-5 bg-navy/20 mx-1" />

      <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
        <List className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
        <ListOrdered className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive("blockquote")} title="Quote">
        <Quote className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-5 bg-navy/20 mx-1" />

      <MenuButton onClick={toggleLink} isActive={editor.isActive("link")} title="Hyperlink">
        <LinkIcon className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={addImage} title="Insert Image">
        <ImageIcon className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={addVideo} title="Embed YouTube Video">
        <Video className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-5 bg-navy/20 mx-1" />

      <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
        <Undo className="w-4 h-4" />
      </MenuButton>
      <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
        <Redo className="w-4 h-4" />
      </MenuButton>
    </div>
  );
};

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false }),
      Youtube.configure({
        inline: false,
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg shadow-sm my-4",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base prose-navy max-w-none p-4 min-h-[300px] outline-none focus:ring-0",
      },
    },
  });

  return (
    <div className="border border-navy/15 rounded-lg bg-white overflow-hidden flex flex-col">
      <MenuBar editor={editor} />
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
