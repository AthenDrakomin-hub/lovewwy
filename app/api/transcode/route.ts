import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 模拟转码任务存储
const transcodingTasks = new Map<string, { status: string; progress: number }>();

export async function POST(request: Request) {
  try {
    const { key, formats = ['mp4', 'webm'] } = await request.json();

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // 生成任务ID
    const taskId = `transcode_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // 模拟转码任务
    transcodingTasks.set(taskId, { status: 'queued', progress: 0 });

    // 模拟异步转码处理（实际应用中应使用队列或后台任务）
    setTimeout(() => {
      transcodingTasks.set(taskId, { status: 'processing', progress: 50 });
      setTimeout(() => {
        transcodingTasks.set(taskId, { status: 'completed', progress: 100 });
      }, 5000);
    }, 1000);

    return NextResponse.json({
      taskId,
      message: 'Transcoding task started',
      key,
      formats,
    });
  } catch (error) {
    console.error('Error starting transcoding task:', error);
    return NextResponse.json(
      { error: 'Failed to start transcoding' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing required parameter: taskId' },
        { status: 400 }
      );
    }

    const task = transcodingTasks.get(taskId);
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      taskId,
      status: task.status,
      progress: task.progress,
    });
  } catch (error) {
    console.error('Error getting transcoding task status:', error);
    return NextResponse.json(
      { error: 'Failed to get task status' },
      { status: 500 }
    );
  }
}
