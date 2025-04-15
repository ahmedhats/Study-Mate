"use strict";(self.webpackChunkstudy_mate=self.webpackChunkstudy_mate||[]).push([[836],{3836:(e,s,t)=>{t.r(s),t.d(s,{default:()=>Y});var n=t(5043),i=t(8964),a=t(1529);const r=a.Ay.div`
  padding: 12px;
  margin: 8px;
  max-width: 70%;
  border-radius: 8px;
  background-color: ${e=>e.isSender?"#1890ff":"#f0f2f5"};
  color: ${e=>e.isSender?"white":"rgba(0, 0, 0, 0.85)"};
  align-self: ${e=>e.isSender?"flex-end":"flex-start"};
`,d=a.Ay.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
`,l=a.Ay.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
`,o=a.Ay.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 10px;
`,c=a.Ay.div`
  padding: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: ${e=>e.active?"#e6f7ff":"transparent"};
  &:hover {
    background-color: #f5f5f5;
  }
`,x=a.Ay.div`
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
`,h=a.Ay.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 16px;
  flex-direction: column;
  gap: 12px;
`;var g=t(1982),p=t(8592),m=t(5471),f=t(7490),u=t(5964),y=t(579);const{Search:j}=g.A,{Text:v}=p.A,A=e=>{let{conversations:s,activeChat:t,onSelectChat:n}=e;return(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)("div",{style:{padding:"20px 16px"},children:(0,y.jsx)(j,{placeholder:"Search messages"})}),(0,y.jsx)(m.A,{dataSource:s,renderItem:e=>(0,y.jsxs)(c,{active:(null===t||void 0===t?void 0:t.id)===e.id,onClick:()=>n(e),children:[(0,y.jsx)(f.A,{count:e.unread,children:(0,y.jsx)(u.A,{src:e.avatar,size:40})}),(0,y.jsxs)("div",{style:{marginLeft:12,flex:1},children:[(0,y.jsx)(v,{strong:!0,children:e.name}),(0,y.jsx)("div",{children:(0,y.jsx)(v,{type:"secondary",style:{fontSize:"14px"},children:e.lastMessage})})]}),(0,y.jsx)(v,{type:"secondary",style:{fontSize:"12px"},children:e.time})]})})]})},{Text:S}=p.A,k=e=>{let{activeChat:s}=e;return s?(0,y.jsxs)(x,{children:[(0,y.jsx)(u.A,{src:s.avatar,size:40}),(0,y.jsxs)("div",{children:[(0,y.jsx)(S,{strong:!0,style:{fontSize:"16px",display:"block"},children:s.name}),(0,y.jsx)(S,{type:"secondary",children:"Online"})]})]}):null},{Text:b}=p.A,w=e=>{let{message:s}=e;return(0,y.jsxs)(r,{isSender:s.isSender,children:[(0,y.jsx)("div",{style:{marginBottom:4},children:(0,y.jsx)(b,{strong:!0,style:{color:s.isSender?"white":"inherit"},children:s.sender})}),s.content,(0,y.jsx)("div",{style:{marginTop:4},children:(0,y.jsx)(b,{style:{fontSize:"12px",color:s.isSender?"rgba(255,255,255,0.8)":"rgba(0,0,0,0.45)"},children:s.time})})]})},C=e=>{let{messages:s}=e;return(0,y.jsx)(l,{children:s.map((e=>(0,y.jsx)(w,{message:e},e.id)))})};var M=t(3567),z=t(2297),T=t(4394),D=t(3220);const E=e=>{let{value:s,onChange:t,onSend:n,onEmojiClick:i}=e;return(0,y.jsx)(o,{children:(0,y.jsx)(g.A,{size:"large",value:s,onChange:e=>t(e.target.value),onKeyPress:e=>{"Enter"!==e.key||e.shiftKey||(e.preventDefault(),n())},placeholder:"Type a message...",style:{flex:1},suffix:(0,y.jsxs)("div",{style:{display:"flex",gap:"8px"},children:[(0,y.jsx)(M.A,{content:(0,y.jsx)(D.Ay,{onEmojiClick:i}),trigger:"click",placement:"topRight",children:(0,y.jsx)(z.A,{style:{color:"#1890ff",cursor:"pointer"}})}),(0,y.jsx)(T.A,{onClick:n,style:{color:"#1890ff",cursor:"pointer"}})]})})})};var K=t(3117);const $=()=>(0,y.jsxs)(h,{children:[(0,y.jsx)(K.A,{style:{fontSize:"32px",opacity:.5}}),(0,y.jsx)("p",{children:"Select a conversation to start chatting"})]}),{Content:J,Sider:P}=i.A,Y=()=>{const[e,s]=(0,n.useState)(null),[t,a]=(0,n.useState)(""),[r,l]=(0,n.useState)([{id:1,name:"Penny Adi W",avatar:"https://xsgames.co/randomusers/avatar.php?g=male",lastMessage:"Thanks a lot Doctor",time:"14h",unread:2,messages:[{id:1,content:"I just updated the task management dashboard. Can you check if everything looks good?",sender:"Penny Adi W",isSender:!1,time:"10:30 AM"},{id:2,content:"Yes, lets focus on that. Also, can you review the timeline for the project integration?",sender:"Me",isSender:!0,time:"10:35 AM"}]},{id:2,name:"Nina Kartika",avatar:"https://xsgames.co/randomusers/avatar.php?g=female",lastMessage:"Add consultation with me",time:"2d",unread:0,messages:[{id:1,content:"Hi, can we schedule a consultation?",sender:"Nina Kartika",isSender:!1,time:"09:15 AM"}]},{id:3,name:"Arvin Deniawan",avatar:"https://xsgames.co/randomusers/avatar.php?g=male",lastMessage:"Just need one by the way",time:"Yesterday",unread:1,messages:[{id:1,content:"Just need one by the way",sender:"Arvin Deniawan",isSender:!1,time:"Yesterday"}]}]);return(0,y.jsxs)(i.A,{style:{height:"100vh"},children:[(0,y.jsx)(P,{width:300,theme:"light",style:{borderRight:"1px solid #f0f0f0"},children:(0,y.jsx)(A,{conversations:r,activeChat:e,onSelectChat:e=>{s(e),l((s=>s.map((s=>s.id===e.id?{...s,unread:0}:s))))}})}),(0,y.jsx)(J,{style:{background:"#fff"},children:e?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(k,{activeChat:e}),(0,y.jsxs)(d,{children:[(0,y.jsx)(C,{messages:e.messages}),(0,y.jsx)(E,{value:t,onChange:a,onSend:()=>{if(!t.trim()||!e)return;const s={id:Date.now(),content:t,sender:"Me",isSender:!0,time:(new Date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})};l((n=>n.map((n=>n.id===e.id?{...n,messages:[...n.messages,s],lastMessage:t,time:"Just now"}:n)))),a("")},onEmojiClick:e=>{a((s=>s+e.emoji))}})]})]}):(0,y.jsx)($,{})})]})}}}]);
//# sourceMappingURL=836.2001fa0c.chunk.js.map