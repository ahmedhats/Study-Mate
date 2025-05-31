import { create } from 'zustand';
import {
    CloudOutlined,
    ThunderboltOutlined,
    EyeOutlined,
    SmileOutlined,
    UserSwitchOutlined,
    AppleOutlined,
    AimOutlined,
    BulbOutlined,
    SunOutlined,
    HeartOutlined,
    CustomerServiceOutlined,
    VerticalAlignTopOutlined,
    MobileOutlined ,
    QuestionCircleOutlined,
    LoadingOutlined,
} from '@ant-design/icons';

const initialTips = [
    {
        id: "hydrate",
        title: "Hydrate Often",
        description: "Don't forget to drink water every study session.",
        icon: <CloudOutlined style={{ fontSize: 40, color: '#00BCD4' }} />,
    },
    {
        id: "move",
        title: "Get Moving",
        description: "Do 10 push-ups or stretches every 45 minutes.",
        icon: <ThunderboltOutlined style={{ fontSize: 40, color: '#43A047' }} />,
    },
    {
        id: "eye-breaks",
        title: "Eye Breaks",
        description: "Follow the 20-20-20 rule: every 20 min, look at something 20 ft away for 20 sec.",
        icon: <EyeOutlined style={{ fontSize: 40, color: '#FF9800' }} />,
    },
    {
        id: "breathe",
        title: "Mindful Breathing",
        description: "Take 5 deep breaths when you feel overwhelmed.",
        icon: <SmileOutlined style={{ fontSize: 40, color: '#1976D2' }} />,
    },
    {
        id: "posture",
        title: "Posture Check",
        description: "Straighten your back and relax your shoulders every hour.",
        icon: <UserSwitchOutlined style={{ fontSize: 40, color: '#8E24AA' }} />,
    },
    {
        id: "snack",
        title: "Snack Smart",
        description: "Choose protein or fruit over sugar for sustained energy.",
        icon: <AppleOutlined style={{ fontSize: 40, color: '#FBC02D' }} />,
    },
    {
        id: "walk",
        title: "Short Walks",
        description: "Take a 5-minute walk after completing each task.",
        icon: <AimOutlined style={{ fontSize: 40, color: '#0288D1' }} />,
    },
    {
        id: "sunlight",
        title: "Catch Some Sun",
        description: "Get a few minutes of sunlight to regulate your sleep and boost mood.",
        icon: <SunOutlined style={{ fontSize: 40, color: '#FFB300' }} />,
    },
    {
        id: "gratitude",
        title: "Gratitude Note",
        description: "Write one thing you're grateful for. It can boost your mental clarity.",
        icon: <HeartOutlined style={{ fontSize: 40, color: '#E91E63' }} />,
    },
    {
        id: "music",
        title: "Ambient Focus",
        description: "Play some ambient music to stay in the zone while studying.",
        icon: <CustomerServiceOutlined style={{ fontSize: 40, color: '#3F51B5' }} />,
    },
    {
        id: "stand",
        title: "Stand & Stretch",
        description: "Stand up and stretch your arms and legs every 30 minutes.",
        icon: <VerticalAlignTopOutlined style={{ fontSize: 40, color: '#4CAF50' }} />,
    },
    {
        id: "digital-detox",
        title: "Digital Detox",
        description: "Put your phone away for 1 hour. Train your brain to focus deeply.",
        icon: <MobileOutlined  style={{ fontSize: 40, color: '#9E9E9E' }} />,
    },
    {
        id: "check-in",
        title: "Self Check-In",
        description: "Pause and ask yourself how you're feeling. Acknowledge your emotions.",
        icon: <QuestionCircleOutlined style={{ fontSize: 40, color: '#607D8B' }} />,
    },
    {
        id: "breathing-box",
        title: "Box Breathing",
        description: "Try 4-4-4-4 breathing: inhale, hold, exhale, hold—all for 4 seconds.",
        icon: <LoadingOutlined style={{ fontSize: 40, color: '#00ACC1' }} />,
    },
    {
        id: "smile",
        title: "Smile Break",
        description: "Take a moment to smile—yes, really. It boosts your mood instantly.",
        icon: <SmileOutlined style={{ fontSize: 40, color: '#FF7043' }} />,
    },
];

const getPersistedTips = () => {
    try {
        const data = localStorage.getItem('wellnessTips');
        if (data) return JSON.parse(data);
    } catch { }
    return null;
};

const persistTips = (tips) => {
    try {
        localStorage.setItem('wellnessTips', JSON.stringify(tips));
    } catch { }
};

const useTipsStore = create((set, get) => ({
    tips: getPersistedTips() || initialTips.map(t => ({ ...t, isFavorite: false, isCustom: false })),
    favoriteTip: (id) => set(state => {
        const tips = state.tips.map(tip =>
            tip.id === id ? { ...tip, isFavorite: !tip.isFavorite } : tip
        );
        persistTips(tips);
        return { tips };
    }),
    dismissTip: (id) => set(state => {
        const tips = state.tips.filter(tip => tip.id !== id);
        persistTips(tips);
        return { tips };
    }),
    addCustomTip: (title, description) => set(state => {
        const newTip = {
            id: `custom-${Date.now()}`,
            title: title.length > 24 ? title.slice(0, 24) + '…' : title,
            description: description,
            icon: <BulbOutlined style={{ fontSize: 40, color: '#607D8B' }} />,
            isFavorite: false,
            isCustom: true,
        };
        const tips = [newTip, ...state.tips];
        persistTips(tips);
        return { tips };
    }),
}));

export default useTipsStore; 