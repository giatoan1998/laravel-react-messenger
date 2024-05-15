import { usePage } from "@inertiajs/react";
// một hook từ thư viện Inertia.js, được sử dụng để truy cập vào dữ liệu trang hiện tại.
import { useEffect, useState } from "react";

import { PencilSquareIcon } from "@heroicons/react/24/solid"
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;

    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);

    // thuộc tính được trích xuất từ dữ liệu trang.
    const [onlineUsers, setOnlineUsers] = useState({});

    const isUserOnline = (userId) => onlineUsers[userId];
    // trả về true nếu userId có trong đối tượng onlineUsers.
    
    // console.log("conversations123", conversations);
    // console.log("selectedConversation456", selectedConversation);

    const onSearch = (ev) => {
        const search = ev.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return conversation.name.toLowerCase().includes(search);
            })
        );
    }

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {

                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);

    console.log("sortedConversations", sortedConversations);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    console.log("localConversations", );

    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const onlineUserObj = Object.fromEntries(
                    // Object.fromEntries sử dụng để tạo ra một đối tượng từ một mảng chứa các cặp key-value.
                    users.map((user) => [user.id, user])
                );

                setOnlineUsers((prevOnlineUsers) => {
                    return { ...prevOnlineUsers, ...onlineUserObj };
                });
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    updatedUsers[user.id] = user;

                    return updatedUsers;
                });
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = {...prevOnlineUsers};
                    delete updatedUsers[user.id];

                    return updatedUsers;
                });
            })
            .error((error) => {
                console.error("error", error);
            });
        
            return () => {
                Echo.leave("online");
            }
    }, []);

    return (
        <>
            <div className="flex-1 w-full flex overflow-hidden">
                <div
                    className={`transition-all w-full sm:w-[220px] md:w-[300px] bg-slate-800 flex flex-col overflow-hidden
                        ${
                            selectedConversation ? "-ml-[100%] sm:ml-0" : ""
                        }
                    `}
                >
                    <div className="flex items-center justify-between py-2 px-3 text-xl font-medium text-gray-200">
                        My conversations
                        <div
                            className="tooltip tooltip-left"
                            data-tip="Create new Group"
                        >
                            <button
                                className="text-gray-400 hover:text-gray-200"
                            >
                                <PencilSquareIcon className="w-4 h-4 inline-block ml-2"/>
                            </button>
                        </div>
                    </div>
                    <div className="p-3">
                        <TextInput
                            onKeyUp={onSearch}
                            placeholder="Filter users and groups"
                            className="w-full"
                        />
                    </div>
                    <div className="flex-1 overflow-auto">
                        {sortedConversations && 
                            sortedConversations.map((conversation) => (
                                <ConversationItem
                                    key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                                    conversation={conversation}
                                    online={!!isUserOnline(conversation.id)}
                                    // Nếu giá trị là falsy (false, 0, '', null, undefined, NaN), thì !!value sẽ trả về false.
                                    // Nếu giá trị không phải là falsy, thì !!value sẽ trả về true.
                                    selectedConversation={selectedConversation}
                                />
                            ))
                        }
                    </div>
                </div>
                <div className="flex-1 flex flex-col overflow-hidden">
                    {children}
                </div>
            </div>
        </>
    )
}

export default ChatLayout;