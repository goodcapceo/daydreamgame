/**
 * AABB (Axis-Aligned Bounding Box) Collision Detection
 * Works for all rectangular objects
 */
export const useCollision = () => {
  /**
   * Check collision between two rectangles
   */
  const checkAABB = (rect1, rect2) => {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  };

  /**
   * Check if point is inside rectangle
   */
  const pointInRect = (point, rect) => {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  };

  /**
   * Check if circle collides with rectangle
   * Useful for collectibles (circles) vs walls (rectangles)
   */
  const circleRectCollision = (circle, rect) => {
    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

    // Calculate distance
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    const distanceSquared = dx * dx + dy * dy;

    return distanceSquared < (circle.radius * circle.radius);
  };

  /**
   * Check grid-based collision (for tile-based games)
   * Used in World 1 (maze) and World 4 (match-3)
   */
  const checkGridCollision = (gridX, gridY, grid) => {
    if (gridY < 0 || gridY >= grid.length) return true;
    if (gridX < 0 || gridX >= grid[0].length) return true;

    return grid[gridY][gridX] === 1; // 1 = wall
  };

  /**
   * Check platform collision from above
   * Used in World 2 (platformer)
   * Only collides if player is falling and was above platform
   */
  const checkPlatformCollision = (player, platform, previousY) => {
    const playerBottom = player.y + player.height;
    const platformTop = platform.y;
    const platformBottom = platform.y + platform.height;

    // Horizontal overlap
    const overlapX =
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width;

    // Was above, now intersecting
    const wasAbove = previousY + player.height <= platformTop;
    const nowIntersecting =
      playerBottom >= platformTop &&
      player.y < platformBottom;

    return overlapX && wasAbove && nowIntersecting;
  };

  /**
   * Get all entities within radius (for proximity detection)
   * Used for "worried" mood in World 1
   */
  const getEntitiesInRadius = (center, entities, radius) => {
    return entities.filter(entity => {
      const dx = entity.x - center.x;
      const dy = entity.y - center.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  };

  return {
    checkAABB,
    pointInRect,
    circleRectCollision,
    checkGridCollision,
    checkPlatformCollision,
    getEntitiesInRadius,
  };
};
