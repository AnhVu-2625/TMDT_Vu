import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaComments, FaSearch, FaPaperPlane, FaCheck, FaCheckDouble, FaTimes,
  FaUserPlus, FaPhone, FaUser, FaArrowLeft, FaImage,
  FaFile, FaSmile, FaInfoCircle, FaStore, FaRegCircle,
  FaCircle, FaSpinner, FaHeadset, FaShieldAlt, FaStar,
  FaExclamationTriangle, FaMoneyBillWave, FaLock,
  FaBox, FaEye, FaTag, FaClock, FaPlus, FaPaperclip, FaCamera, FaShoppingBag
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const getHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const uid = (u) => u?.maNguoiDung || u?.MaNguoiDung || u?.id;
const uname = (u) => u?.hoTen || u?.HoTen || '';
const urole = (u) => u?.vaiTro || u?.VaiTro || '';

function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:5000${path.startsWith('/') ? '' : '/'}${path}`;
}

const EMOJIS = ['😀','😁','😂','🤣','😃','😄','😅','😆','😉','😊','😋','😎','😍','🥰','😘','😜','🤗','🤩','👍','👎','👊','✌️','🤞','❤️','💙','💚','💛','💜','🖤','💔','🔥','⭐','🎉','🎊','💯','✅','❌','💝','🎁','😢','😭','😤','😡','🥺','😳','🤔','🤭','🙄','😴','🤤','😱','🥳','👏','🙏','💪','🫶','🤝','✨','💥','🌈','🎵'];

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  if (isToday) return `${h}:${m}`;
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Hom qua ${h}:${m}`;
  return `${d.getDate()}/${d.getMonth() + 1} ${h}:${m}`;
}

function formatDateHeader(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Hom nay';
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Hom qua';
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

const QUICK_REPLIES = [
  'San pham con hang khong?',
  'Shop co giao hang khong?',
  'Gia con thuong luong duoc khong?',
  'Toi muon mua san pham nay',
  'Con mau khac khong?',
  'Co bao hanh khong?',
  'Shop o dau vay?',
  'Kich thuoc nay co vua khong?',
];

const SENDER = { ME: 'me', THEM: 'them' };
const RECENT_THRESHOLD = 5 * 60 * 1000;

export default function Chat() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room');

  const myId = uid(user);
  const [tab, setTab] = useState(roomParam ? 'shop' : 'shop');
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeenTimes, setLastSeenTimes] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickRepliesShown, setQuickRepliesShown] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const initialRoomSelected = useRef(false);
  const imageInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const fetchRooms = useCallback(async (roomType) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/chat/rooms?type=${roomType}`, { headers: getHeaders() });
      setRooms(res.data.data || []);
    } catch (err) {
      console.error('Fetch rooms error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRooms(tab); }, [tab, fetchRooms]);

  useEffect(() => {
    if (activeRoom) {
      const key = `msgs_${activeRoom}`;
      if (!messages[key]) fetchMessages(activeRoom);
      markAsRead(activeRoom);
      // Tự động hiển thị quick replies cho phòng mới (chỉ 1 lần)
      if (!quickRepliesShown[activeRoom]) {
        setShowQuickReplies(true);
        setQuickRepliesShown(prev => ({ ...prev, [activeRoom]: true }));
      }
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeRoom]);

  useEffect(() => {
    if (!initialRoomSelected.current && roomParam && rooms.length > 0) {
      const found = rooms.find(r => r.MaPhongChat === parseInt(roomParam));
      if (found) {
        initialRoomSelected.current = true;
        setActiveRoom(found.MaPhongChat);
        if (window.innerWidth < 768) setShowSidebar(false);
        if (found.VaiTroDoiTac === 'QUAN_TRI_VIEN') setTab('support');
      }
    }
  }, [roomParam, rooms]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket
  useEffect(() => {
    const sock = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = sock;

    sock.on('connect', () => {
      if (myId) sock.emit('authenticate', myId);
    });

    sock.on('receive_message', (msg) => {
      const key = `msgs_${msg.MaPhongChat}`;
      setMessages(prev => {
        const ex = prev[key] || [];
        if (ex.some(m => m.MaTinNhan === msg.MaTinNhan)) return prev;
        return { ...prev, [key]: [...ex, msg] };
      });
      fetchRooms(tab);
      if (activeRoom === msg.MaPhongChat) markAsRead(msg.MaPhongChat);
    });

    sock.on('new_room', () => fetchRooms(tab));
    sock.on('room_accepted', () => fetchRooms(tab));
    sock.on('room_rejected', () => fetchRooms(tab));

    sock.on('messages_seen', (data) => {
      const key = `msgs_${data.roomId}`;
      setMessages(prev => {
        const msgs = prev[key];
        if (!msgs) return prev;
        return { ...prev, [key]: msgs.map(m => ({ ...m, DaDoc: true })) };
      });
    });

    sock.on('user_typing', (data) => {
      setTypingUsers(prev => ({ ...prev, [data.roomId]: data.isTyping ? data.userId : null }));
    });

    sock.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
      setLastSeenTimes(prev => ({ ...prev, [data.userId]: null }));
    });

    sock.on('user_offline', (data) => {
      setOnlineUsers(prev => { const n = new Set(prev); n.delete(data.userId); return n; });
      setLastSeenTimes(prev => ({ ...prev, [data.userId]: Date.now() }));
    });

    sock.on('online_users', (data) => {
      if (data?.users) setOnlineUsers(new Set(data.users));
    });

    return () => sock.close();
  }, [myId, tab]);

  useEffect(() => {
    const sock = socketRef.current;
    if (sock && activeRoom) {
      sock.emit('join_chat', { roomId: activeRoom });
      return () => sock.emit('leave_chat', { roomId: activeRoom });
    }
  }, [activeRoom]);

  const fetchMessages = async (roomId) => {
    try {
      const res = await axios.get(`${API_URL}/chat/rooms/${roomId}`, { headers: getHeaders() });
      setMessages(prev => ({ ...prev, [`msgs_${roomId}`]: res.data.data || [] }));
    } catch (err) {
      toast.error('Khong the tai tin nhan');
    }
  };

  const markAsRead = async (roomId) => {
    try {
      await axios.put(`${API_URL}/chat/rooms/${roomId}/read`, {}, { headers: getHeaders() });
      setRooms(prev => prev.map(r =>
        r.MaPhongChat === roomId ? { ...r, SoTinChuaDoc: 0 } : r
      ));
    } catch (err) {}
  };

  const handleSearchUser = async () => {
    if (!searchPhone.trim()) return;
    try {
      const res = await axios.get(`${API_URL}/chat/users/search?phone=${encodeURIComponent(searchPhone)}`, { headers: getHeaders() });
      setSearchResults(res.data.data || []);
      if (res.data.data.length === 0) toast.info('Khong tim thay nguoi dung');
    } catch { toast.error('Loi tim kiem'); }
  };

  const handleStartChat = async (targetUser) => {
    try {
      const res = await axios.post(`${API_URL}/chat/rooms/start`, {
        maNguoiNhan: targetUser.MaNguoiDung, loiNhan: ''
      }, { headers: getHeaders() });
      setShowSearch(false); setSearchPhone(''); setSearchResults([]);
      await fetchRooms(tab);
      setActiveRoom(res.data.data.MaPhongChat);
      setShowSidebar(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Loi'); }
  };

  const handleStartSupport = async () => {
    try {
      const res = await axios.post(`${API_URL}/chat/support/start`, { loiNhan: '' }, { headers: getHeaders() });
      await fetchRooms('support');
      setTab('support');
      setActiveRoom(res.data.data.MaPhongChat);
      setShowSidebar(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Loi'); }
  };

  const handleAccept = async (roomId) => {
    try {
      await axios.put(`${API_URL}/chat/rooms/${roomId}/accept`, {}, { headers: getHeaders() });
      toast.success('Da chap nhan'); await fetchRooms(tab);
    } catch { toast.error('Loi'); }
  };

  const handleReject = async (roomId) => {
    try {
      await axios.put(`${API_URL}/chat/rooms/${roomId}/reject`, {}, { headers: getHeaders() });
      toast.success('Da tu choi'); await fetchRooms(tab);
    } catch { toast.error('Loi'); }
  };

  const handleSend = async (content) => {
    const msg = (content || newMessage).trim();
    if ((!msg && selectedImages.length === 0) || !activeRoom || sending) return;
    setNewMessage(''); setSending(true);

    try {
      // Gửi text nếu có
      if (msg) {
        await axios.post(`${API_URL}/chat/messages`, { maPhongChat: activeRoom, noiDung: msg }, { headers: getHeaders() });
      }

      // Gửi từng ảnh đã upload
      for (const img of selectedImages) {
        const imgMsg = `[Hinh anh] ${img.url}`;
        await axios.post(`${API_URL}/chat/messages`, { maPhongChat: activeRoom, noiDung: imgMsg }, { headers: getHeaders() });
      }

      setSelectedImages([]);
      setImagePreviewUrls([]);
      setShowQuickReplies(false);
      inputRef.current?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Loi gui');
      if (msg) setNewMessage(msg);
    } finally { setSending(false); }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleQuickReply = async (text) => {
    setShowQuickReplies(false);
    setNewMessage('');
    try {
      await axios.post(`${API_URL}/chat/messages`, { maPhongChat: activeRoom, noiDung: text }, { headers: getHeaders() });
      inputRef.current?.focus();
    } catch (err) {
      toast.error('Loi gui tin nhan');
      setNewMessage(text);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newImages = [];
    const newUrls = [];
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      newUrls.push(url);
      newImages.push({ file, preview: url });
    });
    setImagePreviewUrls(prev => [...prev, ...newUrls]);
    setSelectedImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  };

  const handleUploadImages = async () => {
    if (selectedImages.length === 0) return;
    setUploading(true);
    const uploaded = [];
    for (const img of selectedImages) {
      const formData = new FormData();
      formData.append('file', img.file);
      try {
        const res = await axios.post(`${API_URL}/chat/upload`, formData, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } });
        if (res.data.success) uploaded.push(res.data.data);
      } catch (err) {
        toast.error('Loi upload anh');
      }
    }
    setSelectedImages(uploaded);
    setUploading(false);
    // Gửi ngay sau khi upload
    if (uploaded.length > 0) handleSend();
  };

  const removeSelectedImage = (index) => {
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post(`${API_URL}/chat/upload`, formData, { headers: { ...getHeaders(), 'Content-Type': 'multipart/form-data' } });
      if (res.data.success) {
        const fileMsg = `[File] ${res.data.data.name} - ${res.data.data.url}`;
        await axios.post(`${API_URL}/chat/messages`, { maPhongChat: activeRoom, noiDung: fileMsg }, { headers: getHeaders() });
        toast.success('Da gui file');
      }
    } catch (err) {
      toast.error('Loi upload file');
    }
    e.target.value = '';
  };

  const handleShareProduct = () => {
    navigate('/products?fromChat=true');
  };

  const handleTyping = (isTyping) => {
    socketRef.current?.emit('typing', { roomId: activeRoom, userId: myId, isTyping });
  };

  const onInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 2000);
  };

  const onInputKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); handleTyping(false); }
  };

  const selectRoom = (roomId) => {
    setActiveRoom(roomId);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const getSender = (msg, room) => {
    if (!room) return msg.NguoiGui === 'NGUOI_MUA' ? SENDER.ME : SENDER.THEM;
    if (room.LoaiPhong === 'USER_USER') {
      if (room.MaNguoiDung === myId) return msg.NguoiGui === 'NGUOI_MUA' ? SENDER.ME : SENDER.THEM;
      return msg.NguoiGui === 'NGUOI_BAN' ? SENDER.ME : SENDER.THEM;
    }
    return msg.NguoiGui === 'NGUOI_MUA' ? SENDER.ME : SENDER.THEM;
  };

  const getOnlineStatus = (userId) => {
    if (!userId) return 'offline';
    if (onlineUsers.has(userId)) return 'online';
    const lastSeen = lastSeenTimes[userId];
    if (lastSeen && Date.now() - lastSeen < RECENT_THRESHOLD) return 'recent';
    return 'offline';
  };

  const activeMsgs = activeRoom ? (messages[`msgs_${activeRoom}`] || []) : [];
  const activeRoomData = rooms.find(r => r.MaPhongChat === activeRoom);
  const isTyping = activeRoom && typingUsers[activeRoom];
  const isSupport = activeRoomData?.VaiTroDoiTac === 'QUAN_TRI_VIEN' || tab === 'support';
  const partnerStatus = getOnlineStatus(activeRoomData?.MaDoiTac);

  // Product info from DB
  const productInfo = activeRoomData?.TenSanPhamChat ? {
    name: activeRoomData.TenSanPhamChat,
    price: activeRoomData.GiaSanPhamChat,
    image: activeRoomData.AnhSanPhamChat,
    id: activeRoomData.MaSanPhamChat
  } : null;

  // Group messages
  const groupedMsgs = [];
  activeMsgs.forEach((msg, i) => {
    const prev = i > 0 ? activeMsgs[i - 1] : null;
    const showDate = !prev || new Date(msg.NgayTao).toDateString() !== new Date(prev.NgayTao).toDateString();
    const sender = getSender(msg, activeRoomData);
    const lastInGroup = i === activeMsgs.length - 1 || activeMsgs[i + 1].NguoiGui !== msg.NguoiGui;
    groupedMsgs.push({ msg, sender, showDate, group: prev && msg.NguoiGui === prev.NguoiGui, lastInGroup });
  });

  const totalUnread = rooms.reduce((sum, r) => sum + (r.SoTinChuaDoc || 0), 0);

  // Render message content (support images/files)
  const renderMessageContent = (text) => {
    if (text.startsWith('[Hinh anh] ')) {
      const url = text.replace('[Hinh anh] ', '');
      return <img src={getImageUrl(url)} alt="Hinh anh" className="max-w-[240px] rounded-lg" onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class=\"text-slate-400\">Anh khong tai duoc</span>'; }} />;
    }
    if (text.startsWith('[File] ')) {
      const parts = text.replace('[File] ', '').split(' - ');
      const fileName = parts[0];
      const fileUrl = parts.slice(1).join(' - ');
      return (
        <a href={getImageUrl(fileUrl)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg">
          <FaFile size={14} />
          <span className="text-xs underline">{fileName}</span>
        </a>
      );
    }
    return text;
  };

  return (
    <div className="h-screen bg-[#050816] flex overflow-hidden">
      {/* ─── LEFT: Conversation List ─── */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-[340px] lg:w-[360px] flex-shrink-0 border-r border-white/[0.08] bg-[#0B1220]`}>
        <div className="p-4 border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FaComments className="text-blue-400 text-lg" />
              <h1 className="text-lg font-bold text-white">MartChat</h1>
            </div>
            {totalUnread > 0 && (
              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </div>
          <div className="flex bg-slate-800/40 rounded-xl p-0.5 mb-3">
            <button onClick={() => { setTab('shop'); setActiveRoom(null); setShowSearch(false); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'shop' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}>
              <FaStore size={12} className="inline mr-1.5" />Shop
            </button>
            <button onClick={() => { setTab('support'); setActiveRoom(null); setShowSearch(false); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'support' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}>
              <FaHeadset size={12} className="inline mr-1.5" />HoTro
            </button>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
            <input
              onFocus={() => setShowSearch(true)}
              value={searchPhone}
              onChange={e => setSearchPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchUser()}
              placeholder={tab === 'shop' ? "Tim nguoi dung..." : "Tim ho tro..."}
              className="w-full bg-slate-800/50 text-white text-sm pl-9 pr-4 py-2.5 rounded-xl border border-white/[0.06] focus:border-blue-500/50 outline-none transition placeholder:text-slate-600"
            />
          </div>
        </div>

        <AnimatePresence>
          {showSearch && tab === 'shop' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/[0.08]">
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <button onClick={handleSearchUser} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 rounded-lg transition">
                    <FaSearch size={12} className="inline mr-1" /> Tim
                  </button>
                  <button onClick={() => { setShowSearch(false); setSearchPhone(''); setSearchResults([]); }}
                    className="px-3 py-2 text-slate-400 hover:text-white transition"><FaTimes size={14} /></button>
                </div>
                {searchResults.map(u => (
                  <div key={u.MaNguoiDung} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/30 border border-white/[0.06]">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {u.HoTen?.[0] || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{u.HoTen}</p>
                        <p className="text-slate-500 text-xs">{u.SoDienThoai}</p>
                      </div>
                    </div>
                    <button onClick={() => handleStartChat(u)}
                      className="ml-2 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white flex-shrink-0 transition">
                      <FaPaperPlane size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'support' && (
          <div className="px-3 pt-2 pb-1">
            <button onClick={handleStartSupport}
              className="w-full py-2.5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20">
              <FaHeadset size={14} /> Tao yeu cau ho tro
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="space-y-1 p-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="w-12 h-12 rounded-full shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-32 rounded shimmer" />
                    <div className="h-2.5 w-48 rounded shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              {tab === 'support' ? (
                <><FaHeadset size={40} className="mb-4 opacity-20" /><p className="text-sm">Chua co yeu cau ho tro</p><p className="text-xs text-slate-600 mt-1">Bam "Tao yeu cau" de bat dau</p></>
              ) : (
                <><FaComments size={40} className="mb-4 opacity-20" /><p className="text-sm">Chua co cuoc tro chuyen</p><p className="text-xs text-slate-600 mt-1">Tim nguoi dung bang so dien thoai</p></>
              )}
            </div>
          ) : (
            rooms.map(room => {
              const isPending = room.LoaiPhong === 'USER_USER' && room.TrangThai === 'CHO_CHAP_NHAN';
              const isRejected = room.LoaiPhong === 'USER_USER' && room.TrangThai === 'DA_TU_CHOI';
              const isOwner = room.MaNguoiDung === myId;
              const roomOnline = getOnlineStatus(room.MaDoiTac) === 'online';
              const unread = room.SoTinChuaDoc || 0;
              const isSupportChat = room.VaiTroDoiTac === 'QUAN_TRI_VIEN';
              return (
                <div key={room.MaPhongChat}
                  onClick={() => { if (!isRejected) selectRoom(room.MaPhongChat); }}
                  className={`flex items-center gap-3 p-3 mx-2 my-0.5 rounded-xl cursor-pointer transition-all duration-150
                    ${activeRoom === room.MaPhongChat
                      ? 'bg-blue-600/15 shadow-[0_0_20px_rgba(37,99,235,0.08)] border border-blue-500/20'
                      : 'hover:bg-white/[0.03] border border-transparent'}
                    ${isRejected ? 'opacity-40' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${isSupportChat ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      {isSupportChat ? <FaHeadset size={16} /> : (room.TenDoiTac?.[0] || '?')}
                    </div>
                    {roomOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0B1220] rounded-full" />
                    )}
                    {isSupportChat && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-[#0B1220] rounded-full flex items-center justify-center">
                        <FaShieldAlt size={7} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-sm font-medium truncate flex items-center gap-1.5">
                        {room.TenDoiTac || 'Shop'}
                        {isSupportChat && <span className="text-[10px] text-amber-400 font-normal">HoTro</span>}
                      </p>
                      <span className="text-[11px] text-slate-500 flex-shrink-0 ml-2">
                        {room.ThoiGianTinCuoi ? formatTime(room.ThoiGianTinCuoi) : room.ThoiGianNhanTinCuoi ? formatTime(room.ThoiGianNhanTinCuoi) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-slate-500 truncate">
                        {isPending && isOwner ? 'Da gui loi moi' :
                         isPending && !isOwner ? 'Da gui loi moi' :
                         isRejected ? 'Da tu choi' :
                         room.TinNhanCuoi || room.SDTDoiTac || ''}
                      </p>
                      {unread > 0 && (
                        <span className="flex-shrink-0 ml-2 min-w-[20px] h-[20px] rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white px-1">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    {isPending && !isOwner && (
                      <div className="flex gap-1.5 mt-2">
                        <button onClick={(e) => { e.stopPropagation(); handleAccept(room.MaPhongChat); }}
                          className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1">
                          <FaCheck size={8} /> Chap nhan
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleReject(room.MaPhongChat); }}
                          className="text-[10px] bg-red-600/20 hover:bg-red-600/40 text-red-400 px-2.5 py-1 rounded-lg transition flex items-center gap-1">
                          <FaTimes size={8} /> Tu choi
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── CENTER: Chat Area ─── */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#050816] min-w-0`}>
        {!activeRoom ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-slate-500">
              <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-slate-800/50 border border-white/[0.06] flex items-center justify-center">
                <FaComments size={32} className="opacity-30" />
              </div>
              <p className="text-base font-medium text-slate-400">Chon doan thoai de bat dau</p>
              <p className="text-xs text-slate-600 mt-2">Nhan tin voi shop hoac ho tro</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-[#0B1220]/80 backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => { setShowSidebar(true); setActiveRoom(null); }}
                  className="md:hidden w-9 h-9 rounded-lg bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-white transition mr-1">
                  <FaArrowLeft size={16} />
                </button>
                <div className="relative flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm
                    ${isSupport ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                    {isSupport ? <FaHeadset size={16} /> : (activeRoomData?.TenDoiTac?.[0] || '?')}
                  </div>
                  {partnerStatus === 'online' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B1220] rounded-full" />
                  )}
                  {isSupport && (
                    <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 border-2 border-[#0B1220] rounded-full flex items-center justify-center">
                      <FaShieldAlt size={7} className="text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium truncate">{activeRoomData?.TenDoiTac || 'Shop'}</p>
                    {isSupport && (
                      <span className="text-[10px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                        <FaShieldAlt size={8} /> Ho tro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] flex items-center gap-1">
                    {partnerStatus === 'online' ? (
                      <><FaCircle size={6} className="text-emerald-400" /><span className="text-emerald-400">Online</span></>
                    ) : partnerStatus === 'recent' ? (
                      <><FaClock size={10} className="text-yellow-400" /><span className="text-yellow-400">Vua hoat dong</span></>
                    ) : (
                      <><FaRegCircle size={6} className="text-slate-500" /><span className="text-slate-500">Offline</span></>
                    )}
                    {isTyping && <span className="text-blue-400 ml-2">dang nhap...</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* Product card from DB */}
            {productInfo && (
              <div className="mx-4 mt-3 mb-1 p-3 bg-slate-800/40 rounded-xl border border-white/[0.06] flex items-center gap-3">
                {productInfo.image ? (
                  <img src={getImageUrl(productInfo.image)} alt={productInfo.name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex'; }} />
                ) : null}
                <div className={`w-12 h-12 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0 fallback-icon ${productInfo.image ? 'hidden' : ''}`}>
                  <FaBox size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{productInfo.name}</p>
                  {productInfo.price && (
                    <p className="text-red-400 text-xs font-semibold mt-0.5">
                      {parseInt(productInfo.price).toLocaleString('vi-VN')}d
                    </p>
                  )}
                </div>
                {productInfo.id && (
                  <a href={`/products/${productInfo.id}`}
                    className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1.5 rounded-lg border border-blue-500/20 flex items-center gap-1 flex-shrink-0">
                    <FaEye size={10} /> Xem SP
                  </a>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 scrollbar-thin" style={{ scrollBehavior: 'smooth' }}>
              {groupedMsgs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <FaComments size={28} className="mb-3 opacity-20" />
                  <p className="text-sm">Chua co tin nhan nao</p>
                  <p className="text-xs text-slate-600 mt-1">Hay gui loi nhan dau tien</p>
                </div>
              ) : (
                groupedMsgs.map(({ msg, sender, showDate, group, lastInGroup }, idx) => (
                  <React.Fragment key={msg.MaTinNhan || msg.NgayTao + idx}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-[11px] text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full font-medium">
                          {formatDateHeader(msg.NgayTao)}
                        </span>
                      </div>
                    )}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                      className={`flex ${sender === SENDER.ME ? 'justify-end pr-3' : 'justify-start pl-3'} ${group ? 'mt-0.5' : 'mt-2'}`}>
                      <div className={`flex items-end gap-2 ${sender === SENDER.ME ? 'flex-row-reverse' : 'flex-row'} ${sender === SENDER.ME ? 'ml-12' : 'mr-12'} lg:ml-16 lg:mr-16`}>
                        {sender === SENDER.THEM && (!group || idx === 0 || getSender(activeMsgs[idx - 1], activeRoomData) !== SENDER.THEM) ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mb-0.5
                            ${isSupport ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                            {isSupport ? <FaHeadset size={12} /> : (activeRoomData?.TenDoiTac?.[0] || '?')}
                          </div>
                        ) : sender === SENDER.THEM ? (
                          <div className="w-8 flex-shrink-0" />
                        ) : null}
                        <div className={`flex flex-col ${sender === SENDER.ME ? 'items-end' : 'items-start'}`}>
                          <div className={`px-3.5 py-2 text-sm leading-relaxed ${
                            sender === SENDER.ME
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl rounded-br-md'
                              : 'bg-[#2A3447] text-white rounded-2xl rounded-bl-md'
                          }`}
                          style={{ maxWidth: 'min(60vw, 480px)' }}>
                            {renderMessageContent(msg.NoiDung)}
                          </div>
                          {lastInGroup && (
                            <div className={`flex items-center gap-1.5 mt-0.5 ${sender === SENDER.ME ? 'flex-row' : 'flex-row-reverse'}`}>
                              <span className="text-[10px] text-slate-500">{formatTime(msg.NgayTao)}</span>
                              {sender === SENDER.ME && (
                                msg.DaDoc
                                  ? <span className="flex items-center gap-0.5"><FaCheckDouble size={10} className="text-blue-400" /><span className="text-[9px] text-blue-400">Da xem</span></span>
                                  : <span className="flex items-center gap-0.5"><FaCheck size={10} className="text-slate-500" /><span className="text-[9px] text-slate-500">Da gui</span></span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                ))
              )}

              {isTyping && (
                <div className="flex justify-start pl-3 mt-2">
                  <div className="flex items-end gap-2 mr-16 lg:mr-24">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0
                      ${isSupport ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      {isSupport ? <FaHeadset size={12} /> : (activeRoomData?.TenDoiTac?.[0] || '?')}
                    </div>
                    <div className="bg-[#2A3447] px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Image preview */}
            {imagePreviewUrls.length > 0 && (
              <div className="px-4 py-2 bg-[#0B1220]/80 border-t border-white/[0.08]">
                <div className="flex gap-2 flex-wrap">
                  {imagePreviewUrls.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt="Preview" className="w-16 h-16 rounded-lg object-cover border border-white/[0.1]" />
                      <button onClick={() => removeSelectedImage(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] opacity-0 group-hover:opacity-100 transition">
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                  {selectedImages.length > 0 && selectedImages.every(s => s.file) && (
                    <button onClick={handleUploadImages} disabled={uploading}
                      className="w-16 h-16 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white text-xs transition disabled:opacity-50">
                      {uploading ? <FaSpinner size={16} className="animate-spin" /> : 'Gui'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Input */}
            {activeRoomData?.TrangThai === 'DA_TU_CHOI' ? (
              <div className="p-4 border-t border-white/[0.08] text-center text-red-400 text-sm bg-[#0B1220]/80">Doan thoai da bi tu choi</div>
            ) : activeRoomData?.LoaiPhong === 'USER_USER' && activeRoomData?.TrangThai === 'CHO_CHAP_NHAN' && activeRoomData?.MaNguoiDung !== myId ? (
              <div className="p-4 border-t border-white/[0.08] text-center text-yellow-400 text-sm bg-[#0B1220]/80">Vui long chap nhan tro chuyen</div>
            ) : (
              <div className="px-4 py-3 border-t border-white/[0.08] bg-[#0B1220]/80 backdrop-blur-sm">
                {/* Quick replies - scroll ngang, không wrap */}
                <div className="flex gap-2 mb-2 overflow-x-auto scrollbar-thin pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {QUICK_REPLIES.map((text, i) => (
                    <button key={i} onClick={() => handleQuickReply(text)}
                      className="text-[11px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded-full border border-white/[0.06] transition whitespace-nowrap hover:text-white flex-shrink-0">
                      {text}
                    </button>
                  ))}
                </div>

                <div className="relative flex items-center gap-2 bg-slate-800/50 rounded-2xl border border-white/[0.06] px-4 py-1.5">
                  <div className="relative">
                    <button onClick={() => setShowEmojiPicker(prev => !prev)}
                      className={`text-slate-500 hover:text-white transition p-1 ${showEmojiPicker ? 'text-blue-400' : ''}`}>
                      <FaSmile size={18} />
                    </button>
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-full left-0 mb-2 w-[280px] p-2 bg-slate-800 rounded-xl border border-white/[0.08] shadow-xl z-50">
                        <div className="grid grid-cols-7 gap-1">
                          {EMOJIS.map((emoji, i) => (
                            <button key={i} onClick={() => handleEmojiClick(emoji)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-slate-700 rounded-lg text-lg transition">
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button onClick={() => imageInputRef.current?.click()} className="text-slate-500 hover:text-white transition p-1">
                    <FaImage size={18} />
                  </button>
                  <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  <button onClick={handleFileSelect} className="text-slate-500 hover:text-white transition p-1">
                    <FaPaperclip size={16} />
                  </button>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                  <button onClick={handleShareProduct} className="text-slate-500 hover:text-white transition p-1">
                    <FaShoppingBag size={16} />
                  </button>
                  <input ref={inputRef} value={newMessage} onChange={onInputChange} onKeyDown={onInputKey}
                    placeholder="Nhap tin nhan..."
                    className="flex-1 bg-transparent text-white text-sm px-2 py-2 outline-none placeholder:text-slate-600" />
                  <button onClick={() => handleSend()} disabled={(!newMessage.trim() && selectedImages.length === 0) || sending}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      (newMessage.trim() || selectedImages.length > 0) && !sending
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}>
                    {sending ? <FaSpinner size={16} className="animate-spin" /> : <FaPaperPlane size={16} />}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── RIGHT: Info Panel ─── */}
      {activeRoomData && (
        <div className="hidden lg:flex w-[280px] xl:w-[320px] flex-shrink-0 border-l border-white/[0.08] bg-[#0B1220]">
          <div className="flex-1 p-5 overflow-y-auto">
            {isSupport ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg shadow-emerald-600/20">
                    <FaHeadset size={28} />
                  </div>
                  <h3 className="text-white font-semibold text-base">MartHub Support</h3>
                  <p className="text-amber-400 text-xs flex items-center justify-center gap-1 mt-1">
                    <FaShieldAlt size={10} /> Ho tro chinh thuc
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-white/[0.06]">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Tac vu nhanh</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: FaExclamationTriangle, label: 'Don hang', color: 'text-orange-400' },
                        { icon: FaMoneyBillWave, label: 'Hoan tien', color: 'text-blue-400' },
                        { icon: FaLock, label: 'Thanh toan', color: 'text-purple-400' },
                        { icon: FaUser, label: 'Tai khoan', color: 'text-emerald-400' },
                      ].map(({ icon: Icon, label, color }) => (
                        <button key={label} className={`flex flex-col items-center gap-1 p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-white/[0.04] transition ${color}`}>
                          <Icon size={14} />
                          <span className="text-[10px] text-slate-300">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-lg shadow-blue-600/20">
                    {activeRoomData.TenDoiTac?.[0] || '?'}
                  </div>
                  <h3 className="text-white font-semibold text-base">{activeRoomData.TenDoiTac || 'Shop'}</h3>
                  <p className="text-xs flex items-center justify-center gap-1 mt-1">
                    {partnerStatus === 'online' ? (
                      <><FaCircle size={6} className="text-emerald-400" /><span className="text-emerald-400">Online</span></>
                    ) : partnerStatus === 'recent' ? (
                      <><FaClock size={10} className="text-yellow-400" /><span className="text-yellow-400">Vua hoat dong</span></>
                    ) : (
                      <><FaRegCircle size={6} className="text-slate-500" /><span className="text-slate-500">Offline</span></>
                    )}
                  </p>
                </div>

                {/* Product card from DB */}
                {productInfo && (
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-white/[0.06] mb-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">San pham dang hoi</p>
                    <div className="flex items-center gap-3">
                      {productInfo.image ? (
                        <img src={getImageUrl(productInfo.image)} alt={productInfo.name}
                          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; e.target.parentElement.querySelector('.r-fallback-icon').style.display = 'flex'; }} />
                      ) : null}
                      <div className={`w-14 h-14 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 flex-shrink-0 r-fallback-icon ${productInfo.image ? 'hidden' : ''}`}>
                        <FaBox size={22} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white text-xs font-medium truncate">{productInfo.name}</p>
                        {productInfo.price && (
                          <p className="text-red-400 text-sm font-bold mt-0.5">{parseInt(productInfo.price).toLocaleString('vi-VN')}d</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      {productInfo.id && (
                        <a href={`/products/${productInfo.id}`}
                          className="flex-1 text-center text-[10px] bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-1">
                          <FaEye size={10} /> Xem san pham
                        </a>
                      )}
                      <a href={`/shop/${activeRoomData.MaCuaHang || ''}`}
                        className="flex-1 text-center text-[10px] bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition flex items-center justify-center gap-1">
                        <FaStore size={10} /> Xem shop
                      </a>
                    </div>
                  </div>
                )}

                {/* Contact info */}
                <div className="bg-slate-800/30 rounded-xl p-3 border border-white/[0.06]">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Thong tin lien he</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FaPhone size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 truncate text-xs">{activeRoomData.SDTDoiTac || 'Dang cap nhat'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FaUser size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 text-xs">
                        {activeRoomData.LoaiPhong === 'USER_SHOP' ? 'Nguoi ban' : 'Nguoi mua'}
                      </span>
                    </div>
                  </div>
                </div>

                {activeRoomData.LoaiPhong === 'USER_SHOP' && (
                  <div className="bg-slate-800/30 rounded-xl p-3 border border-white/[0.06] mt-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Cua hang</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FaStore size={12} className="text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 text-xs">{activeRoomData.TenDoiTac || 'Shop'}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
