import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import PropTypes from 'prop-types';
import {
  Bold, Italic, Strikethrough, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo, RemoveFormatting
} from 'lucide-react';
import { useEffect } from 'react';

function ToolbarButton({ onClick, active, title, icon: Icon, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors text-xs flex items-center justify-center ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
      } disabled:opacity-30 disabled:pointer-events-none`}
    >
      <Icon size={15} />
    </button>
  );
}

ToolbarButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  disabled: PropTypes.bool,
};

export default function RichTextEditor({ value, onChange, placeholder = 'Escribe aquí el contenido...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[160px] p-4 text-slate-800 dark:text-slate-200 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
  });

  // Mantener sincronizado si el valor cambia externamente (ej: al cargar datos para editar)
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      if (value === '' && editor.isEmpty) return;
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full h-40 bg-slate-50 dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="w-full border border-slate-200 dark:border-dark-border rounded-xl bg-white dark:bg-dark-card overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-dark-border">
        <ToolbarButton
          icon={Bold}
          title="Negrita (Ctrl+B)"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          title="Cursiva (Ctrl+I)"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          title="Tachado"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

        <ToolbarButton
          icon={Heading2}
          title="Subtítulo Principal (H2)"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          icon={Heading3}
          title="Subtítulo Secundario (H3)"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

        <ToolbarButton
          icon={List}
          title="Lista con viñetas"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          title="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          title="Cita destacada"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Minus}
          title="Línea divisoria"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        />

        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 self-center" />

        <ToolbarButton
          icon={RemoveFormatting}
          title="Limpiar formato"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
        />

        <div className="ml-auto flex items-center gap-1">
          <ToolbarButton
            icon={Undo}
            title="Deshacer (Ctrl+Z)"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo}
            title="Rehacer (Ctrl+Y)"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>
      </div>

      {/* Área editable */}
      <div className="relative">
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-slate-400 pointer-events-none text-sm select-none">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};
