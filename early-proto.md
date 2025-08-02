import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Target, BookOpen, Send, ChevronRight, Sparkles, Check, Star, Heart, Calendar, TrendingUp } from 'lucide-react';

const AdaCoachingApp = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ada', text: "Hi! I'm ADA, your AI coach. I'm here to help you achieve your goals and understand yourself better. How are you feeling today?", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [memories, setMemories] = useState([]);
  const [personalityProfile, setPersonalityProfile] = useState({
    bigFive: {
      openness: null,
      conscientiousness: null,
      extraversion: null,
      agreeableness: null,
      neuroticism: null
    },
    values: [],
    attachmentStyle: null,
    questsCompleted: [],
    lastUpdated: null
  });
  const [currentQuest, setCurrentQuest] = useState(null);
  const [questAnswers, setQuestAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quest definitions
  const quests = {
    bigFive: {
      id: 'bigFive',
      title: 'Big Five Personality',
      description: 'Discover your personality traits',
      icon: '🧠',
      color: 'from-purple-500 to-purple-600',
      questions: [
        // Extraversion
        { trait: 'extraversion', text: 'I feel comfortable being the center of attention', reversed: false },
        { trait: 'extraversion', text: 'I prefer to stay in the background', reversed: true },
        { trait: 'extraversion', text: 'I start conversations easily', reversed: false },
        { trait: 'extraversion', text: 'I find it difficult to approach others', reversed: true },
        
        // Agreeableness
        { trait: 'agreeableness', text: 'I sympathize with others\' feelings', reversed: false },
        { trait: 'agreeableness', text: 'I am not interested in other people\'s problems', reversed: true },
        { trait: 'agreeableness', text: 'I trust others easily', reversed: false },
        { trait: 'agreeableness', text: 'I suspect hidden motives in others', reversed: true },
        
        // Conscientiousness
        { trait: 'conscientiousness', text: 'I am always prepared', reversed: false },
        { trait: 'conscientiousness', text: 'I often forget to put things back in their proper place', reversed: true },
        { trait: 'conscientiousness', text: 'I follow through on my commitments', reversed: false },
        { trait: 'conscientiousness', text: 'I have difficulty sticking to a schedule', reversed: true },
        
        // Neuroticism
        { trait: 'neuroticism', text: 'I get stressed out easily', reversed: false },
        { trait: 'neuroticism', text: 'I rarely feel anxious or worried', reversed: true },
        { trait: 'neuroticism', text: 'My mood changes frequently', reversed: false },
        { trait: 'neuroticism', text: 'I am emotionally stable', reversed: true },
        
        // Openness
        { trait: 'openness', text: 'I have a vivid imagination', reversed: false },
        { trait: 'openness', text: 'I have difficulty understanding abstract ideas', reversed: true },
        { trait: 'openness', text: 'I enjoy trying new things', reversed: false },
        { trait: 'openness', text: 'I prefer routine over variety', reversed: true }
      ]
    },
    values: {
      id: 'values',
      title: 'Core Values',
      description: 'What matters most to you',
      icon: '💎',
      color: 'from-blue-500 to-blue-600',
      type: 'ranking',
      values: [
        { id: 'achievement', name: 'Achievement', description: 'Success and accomplishment' },
        { id: 'autonomy', name: 'Autonomy', description: 'Independence and freedom' },
        { id: 'connection', name: 'Connection', description: 'Relationships and belonging' },
        { id: 'growth', name: 'Growth', description: 'Learning and development' },
        { id: 'purpose', name: 'Purpose', description: 'Meaning and contribution' },
        { id: 'security', name: 'Security', description: 'Stability and safety' },
        { id: 'adventure', name: 'Adventure', description: 'Excitement and new experiences' },
        { id: 'balance', name: 'Balance', description: 'Harmony in all life areas' }
      ]
    },
    attachmentStyle: {
      id: 'attachmentStyle',
      title: 'Attachment Style',
      description: 'Your relationship patterns',
      icon: '❤️',
      color: 'from-pink-500 to-pink-600',
      questions: [
        {
          text: 'In close relationships, I often worry that others don\'t care as much about me as I care about them',
          dimension: 'anxiety'
        },
        {
          text: 'I find it easy to depend on others and have others depend on me',
          dimension: 'avoidance',
          reversed: true
        },
        {
          text: 'I worry about being alone',
          dimension: 'anxiety'
        },
        {
          text: 'I prefer not to show others how I feel deep down',
          dimension: 'avoidance'
        },
        {
          text: 'I often wish that other people\'s feelings for me were as strong as my feelings for them',
          dimension: 'anxiety'
        },
        {
          text: 'I am comfortable sharing my private thoughts and feelings with others',
          dimension: 'avoidance',
          reversed: true
        },
        {
          text: 'I rarely worry about being abandoned',
          dimension: 'anxiety',
          reversed: true
        },
        {
          text: 'I find it difficult to trust others completely',
          dimension: 'avoidance'
        }
      ]
    }
  };

  // Calculate personality scores
  const calculateBigFiveScores = (answers) => {
    const scores = {
      openness: [],
      conscientiousness: [],
      extraversion: [],
      agreeableness: [],
      neuroticism: []
    };

    quests.bigFive.questions.forEach((question, index) => {
      const answer = answers[index];
      const score = question.reversed ? 6 - answer : answer;
      scores[question.trait].push(score);
    });

    const averageScores = {};
    Object.keys(scores).forEach(trait => {
      averageScores[trait] = scores[trait].reduce((a, b) => a + b, 0) / scores[trait].length;
    });

    return averageScores;
  };

  const calculateAttachmentStyle = (answers) => {
    let anxietyScore = 0;
    let avoidanceScore = 0;
    let anxietyCount = 0;
    let avoidanceCount = 0;

    quests.attachmentStyle.questions.forEach((question, index) => {
      const answer = answers[index];
      const score = question.reversed ? 6 - answer : answer;
      
      if (question.dimension === 'anxiety') {
        anxietyScore += score;
        anxietyCount++;
      } else if (question.dimension === 'avoidance') {
        avoidanceScore += score;
        avoidanceCount++;
      }
    });

    const avgAnxiety = anxietyScore / anxietyCount;
    const avgAvoidance = avoidanceScore / avoidanceCount;

    if (avgAnxiety < 3 && avgAvoidance < 3) {
      return 'secure';
    } else if (avgAnxiety >= 3 && avgAvoidance < 3) {
      return 'anxious';
    } else if (avgAnxiety < 3 && avgAvoidance >= 3) {
      return 'avoidant';
    } else {
      return 'fearful-avoidant';
    }
  };

  // Generate breakthrough moments from conversations
  const generateBreakthrough = async (conversation) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [
            {
              role: "user",
              content: `Analyze this coaching conversation and identify if there was a breakthrough moment or key insight. If yes, create a brief, inspiring memory card entry (max 50 words). If no significant breakthrough, respond with "none".

Conversation:
${conversation.slice(-10).map(m => `${m.sender === 'user' ? 'User' : 'ADA'}: ${m.text}`).join('\n')}

Respond with JSON: {"hasBreakthrough": boolean, "title": "string", "insight": "string", "type": "realization|growth|milestone"}`
            }
          ]
        })
      });

      const data = await response.json();
      const result = JSON.parse(data.content[0].text);
      
      if (result.hasBreakthrough) {
        const newMemory = {
          id: Date.now(),
          date: new Date(),
          title: result.title,
          insight: result.insight,
          type: result.type,
          conversationId: Date.now()
        };
        setMemories(prev => [newMemory, ...prev]);
      }
    } catch (error) {
      console.error('Error generating breakthrough:', error);
    }
  };

  // Send message to AI with personality context
  const sendMessageToAI = async (userMessage) => {
    const personalityContext = personalityProfile.questsCompleted.length > 0 ? `
User Personality Profile:
${personalityProfile.bigFive.openness ? `
Big Five Traits:
- Openness: ${(personalityProfile.bigFive.openness * 20).toFixed(0)}%
- Conscientiousness: ${(personalityProfile.bigFive.conscientiousness * 20).toFixed(0)}%
- Extraversion: ${(personalityProfile.bigFive.extraversion * 20).toFixed(0)}%
- Agreeableness: ${(personalityProfile.bigFive.agreeableness * 20).toFixed(0)}%
- Neuroticism: ${(personalityProfile.bigFive.neuroticism * 20).toFixed(0)}%
` : ''}
${personalityProfile.values.length > 0 ? `
Core Values (ranked): ${personalityProfile.values.map((v, i) => `${i + 1}. ${v}`).join(', ')}
` : ''}
${personalityProfile.attachmentStyle ? `
Attachment Style: ${personalityProfile.attachmentStyle}
` : ''}

Provide personalized coaching based on this profile. Adapt your communication style and suggestions to match their personality.` : '';

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are ADA, an empathetic and insightful AI coach. ${personalityContext}

Current conversation (this session only):
${messages.map(m => `${m.sender === 'user' ? 'User' : 'ADA'}: ${m.text}`).join('\n')}

User: ${userMessage}

Respond as a supportive coach, keeping your response concise but meaningful. If you have their personality data, use it to personalize your approach.`
            }
          ]
        })
      });

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Error calling AI:', error);
      return "I'm having trouble connecting right now. Let me try to help you anyway - what's on your mind?";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    const newUserMessage = { id: Date.now(), sender: 'user', text: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    const aiResponse = await sendMessageToAI(userMessage);
    
    const newAiMessage = { id: Date.now() + 1, sender: 'ada', text: aiResponse, timestamp: new Date() };
    setMessages(prev => [...prev, newAiMessage]);
    setIsLoading(false);

    // Check for breakthroughs after a meaningful exchange
    if (messages.length > 5 && messages.length % 5 === 0) {
      generateBreakthrough(messages);
    }
  };

  const startNewConversation = () => {
    if (messages.length > 1) {
      // Save current conversation
      const conversation = {
        id: Date.now(),
        date: new Date(),
        messages: messages,
        summary: messages[messages.length - 1].text.substring(0, 100) + '...'
      };
      setConversations(prev => [conversation, ...prev]);
    }
    
    // Start fresh with personality context maintained
    setMessages([
      { id: Date.now(), sender: 'ada', text: "Welcome back! I'm here to continue supporting your journey. What would you like to explore today?", timestamp: new Date() }
    ]);
  };

  const startQuest = (questId) => {
    setCurrentQuest(questId);
    setQuestAnswers([]);
    setCurrentQuestionIndex(0);
  };

  const handleQuestAnswer = (answer) => {
    const newAnswers = [...questAnswers, answer];
    setQuestAnswers(newAnswers);

    if (currentQuestionIndex < quests[currentQuest].questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      completeQuest(currentQuest, newAnswers);
    }
  };

  const handleValueRanking = (rankedValues) => {
    setPersonalityProfile(prev => ({
      ...prev,
      values: rankedValues.map(v => v.name),
      questsCompleted: [...prev.questsCompleted, 'values'],
      lastUpdated: new Date().toISOString()
    }));
    setCurrentQuest(null);
  };

  const completeQuest = (questId, answers) => {
    if (questId === 'bigFive') {
      const scores = calculateBigFiveScores(answers);
      setPersonalityProfile(prev => ({
        ...prev,
        bigFive: scores,
        questsCompleted: [...prev.questsCompleted, questId],
        lastUpdated: new Date().toISOString()
      }));
    } else if (questId === 'attachmentStyle') {
      const style = calculateAttachmentStyle(answers);
      setPersonalityProfile(prev => ({
        ...prev,
        attachmentStyle: style,
        questsCompleted: [...prev.questsCompleted, questId],
        lastUpdated: new Date().toISOString()
      }));
    }
    setCurrentQuest(null);
  };

  const ValueRanking = ({ values, onComplete }) => {
    const [ranked, setRanked] = useState([]);
    const [unranked, setUnranked] = useState(values);

    const addToRanked = (value) => {
      setRanked([...ranked, value]);
      setUnranked(unranked.filter(v => v.id !== value.id));
    };

    const removeFromRanked = (index) => {
      const removed = ranked[index];
      const newRanked = ranked.filter((_, i) => i !== index);
      setRanked(newRanked);
      setUnranked([...unranked, removed]);
    };

    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-4">Drag to rank your values:</h3>
        
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 min-h-[300px]">
            <p className="text-sm text-gray-600 mb-3">Most Important → Least Important</p>
            {ranked.map((value, index) => (
              <div key={value.id} className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm mb-2 transform transition-all hover:scale-[1.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{value.name}</p>
                      <p className="text-sm text-gray-600">{value.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromRanked(index)}
                    className="text-red-400 hover:text-red-600 text-sm px-3 py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600 mb-2">Available Values:</p>
          {unranked.map(value => (
            <button
              key={value.id}
              onClick={() => addToRanked(value)}
              className="w-full bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all text-left border border-gray-100"
            >
              <p className="font-medium text-gray-800">{value.name}</p>
              <p className="text-sm text-gray-600">{value.description}</p>
            </button>
          ))}
        </div>

        {ranked.length === values.length && (
          <button
            onClick={() => onComplete(ranked)}
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 rounded-xl font-medium hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            Complete Values Assessment
          </button>
        )}
      </div>
    );
  };

  const formatDate = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffTime = Math.abs(now - messageDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Dynamic Header based on active tab */}
      <div className="bg-white/80 backdrop-blur-lg shadow-sm px-4 py-3 safe-area-top">
        <div className="flex items-center justify-between">
          {activeTab === 'chat' && (
            <>
              <div className="w-8" />
              <h1 className="text-xl font-semibold text-gray-800">Chat with ADA</h1>
              <button
                onClick={startNewConversation}
                className="text-blue-500 text-sm font-medium"
              >
                New
              </button>
            </>
          )}
          {activeTab === 'quest' && (
            <>
              <div className="w-8" />
              <h1 className="text-xl font-semibold text-gray-800">Growth Quests</h1>
              <div className="w-8" />
            </>
          )}
          {activeTab === 'journey' && (
            <>
              <div className="w-8" />
              <h1 className="text-xl font-semibold text-gray-800">Your Journey</h1>
              <div className="w-8" />
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'chat' ? (
          <div className="h-full flex flex-col bg-gray-50">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              {messages.map((message, index) => (
                <div key={message.id} className="mb-4">
                  {/* Show timestamp for first message or if significant time gap */}
                  {(index === 0 || 
                    (index > 0 && new Date(message.timestamp) - new Date(messages[index-1].timestamp) > 300000)) && (
                    <div className="text-center mb-3">
                      <span className="text-xs text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full">
                        {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed">{message.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-3 safe-area-bottom">
              <div className="flex gap-2 items-end">
                <div className="flex-1 bg-gray-100 rounded-full px-4 py-2.5">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Message"
                    className="w-full bg-transparent outline-none text-[16px]"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-full transition-all ${
                    inputValue.trim() && !isLoading
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === 'quest' ? (
          <div className="h-full overflow-y-auto bg-gray-50">
            {!currentQuest ? (
              <div className="p-4">
                {/* Progress Overview */}
                {personalityProfile.questsCompleted.length > 0 && (
                  <div className="mb-6 p-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">Your Progress</h3>
                      <Sparkles size={24} />
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="bg-white/20 rounded-full h-2 mb-2">
                          <div 
                            className="bg-white rounded-full h-2 transition-all duration-500"
                            style={{ width: `${(personalityProfile.questsCompleted.length / Object.keys(quests).length) * 100}%` }}
                          />
                        </div>
                        <p className="text-sm text-white/80">
                          {personalityProfile.questsCompleted.length} of {Object.keys(quests).length} quests completed
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quest Cards */}
                <div className="space-y-4">
                  {Object.values(quests).map(quest => {
                    const isCompleted = personalityProfile.questsCompleted.includes(quest.id);
                    return (
                      <button
                        key={quest.id}
                        onClick={() => !isCompleted && startQuest(quest.id)}
                        className={`w-full p-5 rounded-2xl transition-all text-left relative overflow-hidden ${
                          isCompleted 
                            ? 'bg-gray-100 opacity-75' 
                            : 'bg-white shadow-md hover:shadow-lg transform hover:scale-[1.02] cursor-pointer'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${quest.color} opacity-5`} />
                        <div className="relative flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-3xl">{quest.icon}</span>
                              <h3 className="font-semibold text-lg text-gray-800">{quest.title}</h3>
                            </div>
                            <p className="text-gray-600 ml-12">{quest.description}</p>
                          </div>
                          <div className="ml-4 mt-1">
                            {isCompleted ? (
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="text-green-600" size={18} />
                              </div>
                            ) : (
                              <ChevronRight className="text-gray-400" size={24} />
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col bg-white">
                {/* Quest Header */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{quests[currentQuest].icon}</span>
                    <h2 className="text-lg font-semibold">{quests[currentQuest].title}</h2>
                  </div>
                  {quests[currentQuest].questions && (
                    <div className="mt-3">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / quests[currentQuest].questions.length) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Question {currentQuestionIndex + 1} of {quests[currentQuest].questions.length}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quest Content */}
                <div className="flex-1 p-6">
                  {currentQuest === 'values' ? (
                    <ValueRanking
                      values={quests.values.values}
                      onComplete={handleValueRanking}
                    />
                  ) : (
                    <div>
                      <p className="text-lg mb-8 text-gray-800">
                        {quests[currentQuest].questions[currentQuestionIndex].text}
                      </p>
                      <div className="space-y-3">
                        {[
                          { value: 1, label: 'Strongly Disagree' },
                          { value: 2, label: 'Disagree' },
                          { value: 3, label: 'Neutral' },
                          { value: 4, label: 'Agree' },
                          { value: 5, label: 'Strongly Agree' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => handleQuestAnswer(option.value)}
                            className="w-full p-4 text-left rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                                {option.value}
                              </span>
                              <span className="font-medium text-gray-800">{option.label}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cancel Button */}
                <div className="p-4 border-t">
                  <button
                    onClick={() => setCurrentQuest(null)}
                    className="w-full py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Exit Quest
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Journey Tab
          <div className="h-full overflow-y-auto bg-gray-50 pb-20">
            {/* Personality Summary */}
            {personalityProfile.questsCompleted.length > 0 && (
              <div className="p-4">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Star size={20} />
                    Your Personality Profile
                  </h3>
                  
                  {personalityProfile.bigFive.openness && (
                    <div className="space-y-3 mb-4">
                      {Object.entries(personalityProfile.bigFive).map(([trait, score]) => (
                        <div key={trait}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="capitalize">{trait}</span>
                            <span>{(score * 20).toFixed(0)}%</span>
                          </div>
                          <div className="bg-white/20 rounded-full h-2">
                            <div 
                              className="bg-white rounded-full h-2 transition-all duration-500"
                              style={{ width: `${score * 20}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {personalityProfile.values.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-white/80 mb-2">Top Values:</p>
                      <div className="flex flex-wrap gap-2">
                        {personalityProfile.values.slice(0, 3).map((value, index) => (
                          <span key={value} className="bg-white/20 px-3 py-1 rounded-full text-sm">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Memories & Breakthroughs */}
            <div className="px-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-500" />
                Memories & Breakthroughs
              </h3>
              
              {memories.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <div className="text-gray-400 mb-3">
                    <BookOpen size={48} className="mx-auto" />
                  </div>
                  <p className="text-gray-600">Your breakthrough moments will appear here as you chat with ADA.</p>
                </div>
              )}
              
              <div className="space-y-4">
                {memories.map(memory => (
                  <div key={memory.id} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-800">{memory.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        memory.type === 'realization' ? 'bg-purple-100 text-purple-700' :
                        memory.type === 'growth' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {memory.type}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{memory.insight}</p>
                    <p className="text-xs text-gray-400">{formatDate(memory.date)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Past Conversations */}
            <div className="px-4 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageCircle size={20} className="text-blue-500" />
                Past Conversations
              </h3>
              
              {conversations.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center">
                  <p className="text-gray-600">Your conversation history will appear here.</p>
                </div>
              )}
              
              <div className="space-y-3">
                {conversations.map(conv => (
                  <button
                    key={conv.id}
                    className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-500">{formatDate(conv.date)}</p>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {conv.messages.length} messages
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm line-clamp-2">{conv.summary}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'chat' 
                ? 'text-blue-500' 
                : 'text-gray-400'
            }`}
          >
            <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2.5 : 2} />
            <span className="text-xs font-medium">Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('quest')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'quest' 
                ? 'text-blue-500' 
                : 'text-gray-400'
            }`}
          >
            <Target size={24} strokeWidth={activeTab === 'quest' ? 2.5 : 2} />
            <span className="text-xs font-medium">Quest</span>
          </button>
          <button
            onClick={() => setActiveTab('journey')}
            className={`flex-1 py-3 px-4 flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'journey' 
                ? 'text-blue-500' 
                : 'text-gray-400'
            }`}
          >
            <BookOpen size={24} strokeWidth={activeTab === 'journey' ? 2.5 : 2} />
            <span className="text-xs font-medium">Journey</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdaCoachingApp;