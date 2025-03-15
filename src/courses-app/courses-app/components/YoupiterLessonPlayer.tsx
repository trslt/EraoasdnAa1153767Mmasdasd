import NotionLikeEditor from "../editor/NotionLikeEditor";
import { useQuery, getLessonContents } from 'wasp/client/operations';
import { JSONContent } from '@tiptap/react';
import { useEffect, useState } from "react";

interface LessonPlayerProps {
    lessonId: string;
    lang: string;
};

export default function YoupiterLessonPlayer({
    lessonId,
    lang,
}: LessonPlayerProps) {

    const {
        data: lessonContent,
        isLoading: isLoadingLessonContent,
        error: isErrorLessonContent,
        refetch: refetchLessonContent
    } = useQuery(getLessonContents, { lessonId, lang });

    const [currentLessonContent, setCurrentLessonContent] = useState<JSONContent>();

    useEffect(() => {

        if (lessonContent && lessonContent.length > 0) {
            setCurrentLessonContent(lessonContent[0].content as JSONContent);
        }

        refetchLessonContent();

    }, [lessonId, lang]);

    return (
        <>
            {isLoadingLessonContent ? (
                <div>Caricamento editor...</div>
            ) : (
                <NotionLikeEditor
                    contentProp={currentLessonContent}
                    onUpdateFn={(content: JSONContent) => { setCurrentLessonContent(content) }}
                    editable={false}
                />)}
        </>)
};
