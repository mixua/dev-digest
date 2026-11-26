/* CreateSkillModal — review/edit the merged conventions draft, then POST /skills. */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button, FormField, Icon, Modal, TextInput, Textarea, Toggle } from "@devdigest/ui";
import { useSkillDraft } from "@/lib/hooks/conventions";
import { useCreateSkill } from "@/lib/hooks/skills";
import { useToast } from "@/lib/toast";

const SLUG = /^[a-z0-9-]+$/;

export function CreateSkillModal({
  repoId,
  repoFullName,
  onClose,
}: {
  repoId: string;
  repoFullName: string;
  onClose: () => void;
}) {
  const t = useTranslations("conventions.modal");
  const router = useRouter();
  const toast = useToast();
  const draft = useSkillDraft(repoId, true);
  const create = useCreateSkill();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [body, setBody] = React.useState("");
  const [enabled, setEnabled] = React.useState(false);

  // Seed the form once the draft arrives.
  React.useEffect(() => {
    if (!draft.data) return;
    setName(draft.data.name);
    setDescription(draft.data.description);
    setBody(draft.data.body);
  }, [draft.data]);

  const nameValid = SLUG.test(name);
  const dirty = !!draft.data && body !== draft.data.body;
  const canCreate = !!draft.data && nameValid && !!description.trim() && !!body.trim() && !create.isPending;

  const submit = () =>
    create.mutate(
      { name, description, type: "convention", source: "extracted", body, enabled },
      {
        onSuccess: (skill) => {
          toast.success(t("created", { name: skill.name }));
          onClose();
          router.push(`/skills/${skill.id}`);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Modal
      width={680}
      title={t("title")}
      subtitle={t("subtitle", { count: draft.data?.accepted_count ?? 0, repo: repoFullName })}
      onClose={onClose}
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button kind="secondary" onClick={onClose}>{t("cancel")}</Button>
          <Button kind="primary" onClick={submit} disabled={!canCreate}>
            ✦ {create.isPending ? t("creating") : t("create")}
          </Button>
        </div>
      }
    >
      <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {draft.isLoading && <p style={{ color: "var(--text-muted)", fontSize: 13 }}>{t("loadingDraft")}</p>}
        {draft.isError && <p style={{ color: "var(--crit)", fontSize: 13 }}>{t("draftError")}</p>}
        {draft.data && (
          <>
            <FormField
              label={t("name")}
              required
              hint={nameValid ? t("nameHint") : <span style={{ color: "var(--crit)" }}>{t("nameInvalid")}</span>}
            >
              <TextInput value={name} onChange={setName} mono />
            </FormField>
            <FormField label={t("description")} required>
              <TextInput value={description} onChange={setDescription} />
            </FormField>
            <FormField label={t("type")}>
              <TextInput value={t("typeConvention")} onChange={() => {}} disabled />
            </FormField>
            <FormField label={t("enabled")} hint={t("enabledHint")}>
              <Toggle on={enabled} onChange={setEnabled} size={16} />
            </FormField>
            <FormField
              label={
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {t("body")}
                  <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                    <Icon.FileText size={11} /> {name || "skill"}.md
                  </span>
                  {dirty && <span style={{ fontSize: 11, color: "var(--warn)", fontWeight: 500 }}>{t("unsaved")}</span>}
                  <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                    {t("tokens", { count: Math.round(body.length / 4) })}
                  </span>
                </span>
              }
              required
            >
              <Textarea value={body} onChange={setBody} rows={14} mono />
            </FormField>
          </>
        )}
      </div>
    </Modal>
  );
}
