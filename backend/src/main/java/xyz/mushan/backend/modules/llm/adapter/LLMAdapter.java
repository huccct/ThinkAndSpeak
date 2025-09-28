package xyz.mushan.backend.modules.llm.adapter;

import java.util.function.Consumer;

/**
 * @author mushan
 */
public interface LLMAdapter {
    /**
     * 生成回复
     *
     * @param prompt   完整 prompt
     * @return  回复
     */
    String generate(String prompt);

    /**
     * 生成流式回复
     *
     * @param prompt   完整 prompt
     * @param onChunk  每次生成一个文本片段回调（可以是 token、句子或段落）
     * @param onError  出错回调（可为 null）
     * @param onComplete  完成回调（可为 null）
     */
    void generateStream(String prompt,
                        Consumer<String> onChunk,
                        Consumer<Throwable> onError,
                        Runnable onComplete) throws Exception;
}
