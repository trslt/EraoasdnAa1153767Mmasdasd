import React, { useState, useEffect } from 'react';
import {
    Tabbar,
    TabbarLink,
    Icon,
} from 'konsta/react';
import {
    CircleUserRound,
    House,
    Telescope,
    LoaderCircle,
    MessageCircleDashed
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type StudentTabType = 'home' | 'user' | 'courses' | 'chat' |  'profile' | undefined;

export default function StudentTabbar({ tab = undefined } : { tab?: StudentTabType }) {

    const [activeTab, setActiveTab] = useState<StudentTabType>(tab);
    const navigate = useNavigate();

    useEffect(() => {

        const tabMap = {
            home: "/app",
            courses: "/app/courses",
            user: "/app/me/settings",
            chat: "/app/chat",
            profile: "/app/me/profile"
        };

        if(typeof activeTab !== "undefined") {

            navigate(tabMap[activeTab]);
            console.log("active tab cambiato", activeTab)
        }

    }, [activeTab]);

    return (

        <Tabbar
            icons
            className="left-0 bottom-0 fixed"
        >
            <TabbarLink
                active={activeTab === 'profile'}
                onClick={() => setActiveTab('profile')}
                icon={(
                    <Icon
                        ios={<LoaderCircle className="w-7 h-7" />}
                        material={<LoaderCircle className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                active={activeTab === 'courses'}
                onClick={() => setActiveTab('courses')}
                icon={(
                    <Icon
                        ios={<Telescope className="w-7 h-7" />}
                        material={<Telescope className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                active={activeTab === 'home'}
                onClick={() => setActiveTab('home')}
                icon={(
                    <Icon
                        ios={<House className="w-7 h-7" />}
                        material={<House className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                active={activeTab === 'chat'}
                onClick={() => setActiveTab('chat')}
                icon={(
                    <Icon
                        ios={<MessageCircleDashed className="w-7 h-7" />}
                        material={<MessageCircleDashed className="w-6 h-6" />}
                    />
                )
                }
            />
            <TabbarLink
                active={activeTab === 'user'}
                onClick={() => setActiveTab('user')}
                icon={(
                    <Icon
                        ios={<CircleUserRound className="w-7 h-7" />}
                        material={<CircleUserRound className="w-6 h-6" />}
                    />
                )
                }
            />
        </Tabbar>
    );
}



