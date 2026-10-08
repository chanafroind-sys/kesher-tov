import { describe, it, expect } from "vitest";

/**
 * Simulator for atomic redeem_invite logic defined in database migration
 */
export class InviteRedemptionSimulator {
  invites: Map<
    string,
    {
      id: string;
      code: string;
      inviter_id: string;
      max_uses: number;
      used_count: number;
      expires_at: Date;
    }
  > = new Map();

  profiles: Map<string, { id: string; full_name: string; invited_by: string }> = new Map();

  addInvite(invite: {
    id: string;
    code: string;
    inviter_id: string;
    max_uses: number;
    used_count: number;
    expires_at: Date;
  }) {
    this.invites.set(invite.code, invite);
  }

  redeemInvite(
    userId: string,
    code: string,
    fullName = "משתמשת חדשה"
  ): { ok: boolean; data?: { profile_id: string; invited_by: string }; error?: string } {
    const invite = this.invites.get(code.trim());

    if (!invite) {
      return { ok: false, error: "קוד ההזמנה אינו קיים" };
    }

    if (invite.expires_at < new Date()) {
      return { ok: false, error: "פג תוקפו של קוד ההזמנה" };
    }

    if (invite.used_count >= invite.max_uses) {
      return { ok: false, error: "קוד ההזמנה הגיע למכסת השימושים המרבית" };
    }

    // Atomic redemption
    this.profiles.set(userId, {
      id: userId,
      full_name: fullName,
      invited_by: invite.inviter_id,
    });

    invite.used_count += 1;

    return {
      ok: true,
      data: {
        profile_id: userId,
        invited_by: invite.inviter_id,
      },
    };
  }
}

describe("redeem_invite database RPC rules", () => {
  it("redeems valid invite, creates profile with inviter and increments used_count", () => {
    const sim = new InviteRedemptionSimulator();
    sim.addInvite({
      id: "inv-1",
      code: "WELCOME2026",
      inviter_id: "user-sarah",
      max_uses: 5,
      used_count: 0,
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24), // tomorrow
    });

    const res = sim.redeemInvite("user-rachel", "WELCOME2026", "רחל כהן");
    expect(res.ok).toBe(true);
    expect(res.data?.profile_id).toBe("user-rachel");
    expect(res.data?.invited_by).toBe("user-sarah");

    const profile = sim.profiles.get("user-rachel");
    expect(profile?.full_name).toBe("רחל כהן");
    expect(profile?.invited_by).toBe("user-sarah");

    const invite = sim.invites.get("WELCOME2026");
    expect(invite?.used_count).toBe(1);
  });

  it("rejects expired invite code with clear Hebrew message", () => {
    const sim = new InviteRedemptionSimulator();
    sim.addInvite({
      id: "inv-2",
      code: "EXPIRED_CODE",
      inviter_id: "user-sarah",
      max_uses: 5,
      used_count: 0,
      expires_at: new Date(Date.now() - 1000 * 60), // 1 minute ago
    });

    const res = sim.redeemInvite("user-leah", "EXPIRED_CODE");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("פג תוקפו של קוד ההזמנה");
    expect(sim.profiles.has("user-leah")).toBe(false);
  });

  it("rejects invite code that reached max_uses", () => {
    const sim = new InviteRedemptionSimulator();
    sim.addInvite({
      id: "inv-3",
      code: "POPULAR_CODE",
      inviter_id: "user-sarah",
      max_uses: 3,
      used_count: 3,
      expires_at: new Date(Date.now() + 1000 * 60 * 60),
    });

    const res = sim.redeemInvite("user-miriam", "POPULAR_CODE");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("קוד ההזמנה הגיע למכסת השימושים המרבית");
    expect(sim.profiles.has("user-miriam")).toBe(false);
  });

  it("rejects non-existent invite code", () => {
    const sim = new InviteRedemptionSimulator();
    const res = sim.redeemInvite("user-chana", "NO_SUCH_CODE");
    expect(res.ok).toBe(false);
    expect(res.error).toBe("קוד ההזמנה אינו קיים");
  });
});
