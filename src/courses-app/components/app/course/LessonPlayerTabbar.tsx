import {
    Tabbar,
    TabbarLink,
    Icon,
} from 'konsta/react';
import {
    BotMessageSquare,
    LogOut,
    SkipForward,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type StudentTabType = 'exit' | 'skip' | 'courses' | 'chat' | 'profile' | undefined;

export default function LessonPlayerTabbar({ tab = undefined }: { tab?: StudentTabType }) {


    return (

        <Tabbar
            icons
            className="left-0 bottom-0 fixed"
        >

            <TabbarLink
                onClick={() => console.log("exit - // TODO")}
                icon={(
                    <Icon
                        ios={<LogOut className="w-7 h-7" />}
                        material={<LogOut className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                onClick={() => console.log("chat - // TODO")}
                icon={(
                    <Icon
                        ios={<BotMessageSquare className="w-7 h-7" />}
                        material={<BotMessageSquare className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                onClick={() => console.log("skip - // TODO")}
                icon={(
                    <Icon
                        ios={<SkipForward className="w-7 h-7" />}
                        material={<SkipForward className="w-6 h-6" />}
                    />
                )
                }
            />

        </Tabbar>
    );
}



