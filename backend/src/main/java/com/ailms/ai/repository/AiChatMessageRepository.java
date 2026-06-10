package com.ailms.ai.repository;

import com.ailms.ai.entity.AiChatMessage;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, Long> {
    List<AiChatMessage> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
