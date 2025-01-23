const parseTraceData = (traceData: any[]) => {
    return traceData.map((item) => ({
      timestamp: item.timestamp,
      appName: item.app_name,
      operation: item.operation_name,
      prompt: JSON.parse(item.completion_text)[0]["gen_ai.prompt"],
      completion: JSON.parse(item.completion_text)[1]["gen_ai.completion"],
    }));
  };
  