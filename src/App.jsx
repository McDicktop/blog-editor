import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useState, useEffect } from 'react'

const Tiptap = () => {
  const [imageUrl, setImageUrl] = useState('')
  const [activeButtons, setActiveButtons] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading1: false,
    heading2: false,
    heading3: false,
    bulletList: false,
    orderedList: false,
    link: false,
    image: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false,
  })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'image'],
      }),
    ],
    content: '<p>Начните писать ваш пост здесь...</p>',
    onUpdate: ({ editor }) => {
      updateActiveButtons(editor)
    },
    onSelectionUpdate: ({ editor }) => {
      updateActiveButtons(editor)
    },
  })

  const updateActiveButtons = (editorInstance) => {
    setActiveButtons({
      bold: editorInstance.isActive('bold'),
      italic: editorInstance.isActive('italic'),
      underline: editorInstance.isActive('underline'),
      heading1: editorInstance.isActive('heading', { level: 1 }),
      heading2: editorInstance.isActive('heading', { level: 2 }),
      heading3: editorInstance.isActive('heading', { level: 3 }),
      bulletList: editorInstance.isActive('bulletList'),
      orderedList: editorInstance.isActive('orderedList'),
      link: editorInstance.isActive('link'),
      image: editorInstance.isActive('image'),
      alignLeft: editorInstance.isActive({ textAlign: 'left' }),
      alignCenter: editorInstance.isActive({ textAlign: 'center' }),
      alignRight: editorInstance.isActive({ textAlign: 'right' }),
      alignJustify: editorInstance.isActive({ textAlign: 'justify' }),
    })
  }

  const handleButtonClick = (commandFn) => {
    commandFn()
    // Принудительно обновляем состояние кнопок сразу после клика
    setTimeout(() => updateActiveButtons(editor), 10)
  }

  useEffect(() => {
    if (editor) {
      updateActiveButtons(editor)
    }
  }, [editor])

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl('')
      setTimeout(() => updateActiveButtons(editor), 10)
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (upload) => {
        setImageUrl(upload.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const deleteImage = () => {
    if (!editor) return

    const { state } = editor
    const { selection } = state
    const { from } = selection

    const node = state.doc.nodeAt(from)

    if (node && node.type.name === 'image') {
      editor.chain()
        .focus()
        .setTextSelection({ from, to: from + node.nodeSize })
        .deleteSelection()
        .run()
    }
    setTimeout(() => updateActiveButtons(editor), 10)
  }

  if (!editor) {
    return null
  }

  return (
    <div className="editor-container">
      <div className="menu-bar">
        {/* Заголовки */}
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 1 }).run())}
          className={activeButtons.heading1 ? 'is-active' : ''}
        >
          H1
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 2 }).run())}
          className={activeButtons.heading2 ? 'is-active' : ''}
        >
          H2
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleHeading({ level: 3 }).run())}
          className={activeButtons.heading3 ? 'is-active' : ''}
        >
          H3
        </button>

        {/* Основные стили */}
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleBold().run())}
          className={activeButtons.bold ? 'is-active' : ''}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleItalic().run())}
          className={activeButtons.italic ? 'is-active' : ''}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleUnderline().run())}
          className={activeButtons.underline ? 'is-active' : ''}
        >
          <u>U</u>
        </button>

        {/* Списки */}
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleBulletList().run())}
          className={activeButtons.bulletList ? 'is-active' : ''}
        >
          • List
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().toggleOrderedList().run())}
          className={activeButtons.orderedList ? 'is-active' : ''}
        >
          1. List
        </button>

        {/* Выравнивание */}
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().setTextAlign('left').run())}
          className={activeButtons.alignLeft ? 'is-active' : ''}
          title="По левому краю"
        >
          ⎡
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().setTextAlign('center').run())}
          className={activeButtons.alignCenter ? 'is-active' : ''}
          title="По центру"
        >
          ⎜
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().setTextAlign('right').run())}
          className={activeButtons.alignRight ? 'is-active' : ''}
          title="По правому краю"
        >
          ⎣
        </button>
        <button
          onClick={() => handleButtonClick(() => editor.chain().focus().setTextAlign('justify').run())}
          className={activeButtons.alignJustify ? 'is-active' : ''}
          title="По ширине"
        >
          ⎢
        </button>

        {/* Ссылка */}
        <button
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href
            const url = window.prompt('URL', previousUrl)

            if (url === null) return

            if (url === '') {
              editor.chain().focus().unsetLink().run()
              return
            }

            editor.chain().focus().setLink({ href: url }).run()
            setTimeout(() => updateActiveButtons(editor), 10)
          }}
          className={activeButtons.link ? 'is-active' : ''}
        >
          Link
        </button>

        {/* Изображение */}
        <div className="image-upload">
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            id="image-upload-input"
            style={{ display: 'none' }}
          />
          <button onClick={() => document.getElementById('image-upload-input').click()}>
            Загрузить
          </button>
          <button
            onClick={addImage}
            disabled={!imageUrl}
            className={imageUrl ? 'has-image' : ''}
          >
            Вставить
          </button>
        </div>

        {/* Удаление изображения */}
        <button
          onClick={deleteImage}
          disabled={!activeButtons.image}
          className={activeButtons.image ? 'is-active' : ''}
        >
          Удалить
        </button>
      </div>

      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

function App() {
  return (
    <div className="app">
      <h1>Редактор постов с Tiptap</h1>
      <Tiptap />
    </div>
  )
}

export default App