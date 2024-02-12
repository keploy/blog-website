import { useState } from 'react';
import { IoCopyOutline, IoCheckmarkOutline } from 'react-icons/io5'; // Importing icons
import styles from './post-body.module.css';

export default function PostBody({ content }) {
  const [copySuccessList, setCopySuccessList] = useState(Array(content.match(/<pre[\s\S]*?<\/pre>/gm)?.length || 0).fill(false));

  const handleCopyClick = (code, index) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        const updatedList = [...copySuccessList];
        updatedList[index] = true;
        setCopySuccessList(updatedList);
        setTimeout(() => {
          updatedList[index] = false;
          setCopySuccessList(updatedList);
        }, 2000); // Reset copy success state after 2 seconds
      })
      .catch(() => {
        const updatedList = [...copySuccessList];
        updatedList[index] = false;
        setCopySuccessList(updatedList);
      });
  };

  // Function to detect and wrap code blocks with copy button
  const renderCodeBlocks = () => {
    const codeBlocks = content.match(/<pre[\s\S]*?<\/pre>/gm);

    if (!codeBlocks) {
      return (
        <div
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: content }}
          suppressHydrationWarning
        />
      );
    }

    return content.split(/(<pre[\s\S]*?<\/pre>)/gm).map((part, index) => {
      if (/<pre[\s\S]*?<\/pre>/.test(part)) {
        const code = part.match(/<code[\s\S]*?>([\s\S]*?)<\/code>/)[1];
        return (
          <div key={index} className="relative">
            <pre dangerouslySetInnerHTML={{ __html: part }} />
            <button
              onClick={() => handleCopyClick(code, index)}
              className="absolute top-0 right-0 mt-2 mr-2 px-2 py-1 bg-inherit text-white rounded hover:bg-inherit"
            >
              {copySuccessList[index] ? <IoCheckmarkOutline /> : <IoCopyOutline />}
            </button>
          </div>
        );
      }
      return (
        <div
          key={index}
          className={styles.content}
          dangerouslySetInnerHTML={{ __html: part }}
          suppressHydrationWarning
        />
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose lg:prose-xl">{/* Using Tailwind's prose class for better typography */}
        {renderCodeBlocks()}
      </div>
    </div>
  );
}
