import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ApiErrorHandler } from '@/lib/errorHandler';
import { messageSchema, validateWithSchema } from '@/lib/validation';

interface Message {
  id: string;
  subject: string;
  content: string;
  recipient_type: 'admin' | 'teacher';
  status: 'sent' | 'read' | 'replied';
  created_at: string;
  reply_content?: string;
  replied_at?: string;
}

export function MessagingView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipient_type: 'admin' as 'admin' | 'teacher'
  });

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    const result = await ApiErrorHandler.withErrorHandling(
      async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('sender_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      },
      'fetching messages'
    );

    if (result) {
      setMessages(result);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!user) return;

    // Validate form data
    const validation = validateWithSchema(messageSchema, newMessage);
    if (!validation.success) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSending(true);

    const result = await ApiErrorHandler.withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            subject: newMessage.subject,
            content: newMessage.content,
            recipient_type: newMessage.recipient_type,
            status: 'sent'
          });

        if (error) throw error;
        return true;
      },
      'sending message',
      'Message sent successfully!'
    );

    if (result) {
      setNewMessage({ subject: '', content: '', recipient_type: 'admin' });
      fetchMessages(); // Refresh messages
    }
    setSending(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="secondary">Sent</Badge>;
      case 'read':
        return <Badge variant="default">Read</Badge>;
      case 'replied':
        return <Badge variant="destructive">Replied</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Send messages to administrators or teachers for support and feedback.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Send New Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send New Message
            </CardTitle>
            <CardDescription>
              Compose a message to administrators or teachers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select
                value={newMessage.recipient_type}
                onValueChange={(value: 'admin' | 'teacher') => 
                  setNewMessage(prev => ({ ...prev, recipient_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter message subject"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                className={errors.subject ? 'border-destructive' : ''}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Type your message here..."
                className={`min-h-[120px] ${errors.content ? 'border-destructive' : ''}`}
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
              />
              {errors.content && (
                <p className="text-sm text-destructive">{errors.content}</p>
              )}
            </div>

            <Button 
              onClick={sendMessage} 
              disabled={sending || !newMessage.subject.trim() || !newMessage.content.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? 'Sending...' : 'Send Message'}
            </Button>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message History
            </CardTitle>
            <CardDescription>
              Your previous messages and replies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No messages sent yet</p>
                <p className="text-sm">Send your first message using the form on the left</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{message.subject}</h4>
                        <p className="text-xs text-muted-foreground">
                          To: {message.recipient_type === 'admin' ? 'Administrator' : 'Teacher'}
                        </p>
                      </div>
                      {getStatusBadge(message.status)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {message.content}
                    </p>
                    
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                    </p>

                    {message.reply_content && (
                      <div className="mt-3 p-3 bg-muted rounded border-l-4 border-primary">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3" />
                          <span className="text-xs font-medium">Reply</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.replied_at!), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm">{message.reply_content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}